import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/accessControl';
import prisma from '../prismaClient';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import { serializeDecimal } from '../utils/decimal';
import webhookNotificationService from '../services/webhookNotificationService';

const router = express.Router();

// ============================================
// MEDBED CHAMBERS MANAGEMENT
// ============================================

// Get all chambers
router.get('/chambers', authenticate, async (req, res) => {
  try {
    const chambers = await prisma.medbed_chambers.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });

    res.json({ chambers });

  } catch (error) {
    console.error('Error fetching chambers:', error);
    res.status(500).json({ error: 'Failed to fetch chambers' });
  }
});

// Get available time slots for a chamber
router.get('/chambers/:chamberId/slots', authenticate, async (req, res) => {
  try {
    const { chamberId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const requestedDate = new Date(date as string);
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get existing bookings for this chamber on this date
    const bookings = await prisma.medbed_bookings.findMany({
      where: {
        chamberId,
        sessionDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['CONFIRMED', 'PENDING', 'IN_PROGRESS']
        }
      },
      select: {
        sessionDate: true,
        duration: true
      }
    });

    // Generate available slots (9 AM - 9 PM, 1-hour slots)
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      const slotTime = new Date(requestedDate);
      slotTime.setHours(hour, 0, 0, 0);

      // Check if slot is available
      const isBooked = bookings.some(booking => {
        const bookingStart = new Date(booking.sessionDate);
        const bookingEnd = new Date(bookingStart.getTime() + booking * 60000); // duration in minutes
        return slotTime >= bookingStart && slotTime < bookingEnd;
      });

      slots.push({
        time: slotTime.toISOString(),
        hour: `${hour}:00`,
        available: !isBooked
      });
    }

    res.json({ slots });

  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// ============================================
// BOOKING SESSIONS
// ============================================

// Create booking with payment
router.post('/bookings', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { chamberId, sessionDate, duration, notes, paymentMethod } = req.body;

    if (!chamberId || !sessionDate || !duration || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Chamber ID, session date, duration, and payment method are required' 
      });
    }

    // Get chamber details
    const chamber = await prisma.medbed_chambers.findUnique({
      where: { id: chamberId }
    });

    if (!chamber || !chamber.active) {
      return res.status(404).json({ error: 'Chamber not found or inactive' });
    }

    // Calculate cost: $150 per hour
    const hours = duration / 60;
    const cost = new Decimal(hours).mul(150);

    // Check if user has sufficient balance
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { balance: true, cryptoBalance: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (new Decimal(user.balance).lt(cost)) {
      return res.status(400).json({ 
        error: 'Insufficient balance. Please deposit funds first.',
        required: serializeDecimal(cost),
        current: serializeDecimal(user.balance)
      });
    }

    // Create booking
    const booking = await prisma.medbed_bookings.create({
      data: {
        id: uuidv4(),
        userId,
        chamberId,
        sessionDate: new Date(sessionDate),
        duration,
        cost,
        status: 'PENDING',
        notes,
        paymentMethod,
        paymentStatus: 'PENDING'
      }
    });

    // Deduct from user balance
    await prisma.users.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: cost
        }
      }
    });

    // Create transaction record
    await prisma.transactions.create({
      data: {
        id: uuidv4(),
        userId,
        type: 'PAYMENT',
        amount: cost,
        status: 'COMPLETED',
        description: `Medbed booking - ${chamber.name}`,
        provider: paymentMethod,
        metadata: JSON.stringify({ bookingId: booking.id })
      }
    });

    // Send notification
    await webhookNotificationService.createNotification(
      userId,
      'Booking Confirmed',
      `Your medbed session for ${chamber.name} on ${new Date(sessionDate).toLocaleDateString()} has been booked successfully.`,
      'SUCCESS',
      { bookingId: booking.id, chamberId, cost: serializeDecimal(cost) }
    );

    res.json({
      success: true,
      booking: {
        ...booking,
        cost: serializeDecimal(booking.cost)
      },
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings
router.get('/bookings', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.medbed_bookings.findMany({
        where: { userId },
        include: {
          chamber: {
            select: {
              name: true,
              type: true,
              location: true
            }
          }
        },
        orderBy: { sessionDate: 'desc' },
        take: limit,
        skip
      }),
      prisma.medbed_bookings.count({ where: { userId } })
    ]);

    res.json({
      bookings: bookings.map(b => ({
        ...b,
        cost: serializeDecimal(b.cost)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Cancel booking
router.put('/bookings/:bookingId/cancel', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { bookingId } = req.params;

    const booking = await prisma.medbed_bookings.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return res.status(400).json({ error: `Cannot cancel ${booking.status.toLowerCase()} booking` });
    }

    // Refund user balance
    await prisma.users.update({
      where: { id: userId },
      data: {
        balance: {
          increment: booking.cost
        }
      }
    });

    // Update booking status
    await prisma.medbed_bookings.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });

    // Create refund transaction
    await prisma.transactions.create({
      data: {
        id: uuidv4(),
        userId,
        type: 'REFUND',
        amount: booking.cost,
        status: 'COMPLETED',
        description: 'Medbed booking cancellation refund',
        metadata: JSON.stringify({ bookingId })
      }
    });

    // Send notification
    await webhookNotificationService.createNotification(
      userId,
      'Booking Cancelled',
      `Your booking has been cancelled and ${serializeDecimal(booking.cost)} has been refunded to your balance.`,
      'INFO',
      { bookingId, refundAmount: serializeDecimal(booking.cost) }
    );

    res.json({ success: true, message: 'Booking cancelled and refunded' });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;

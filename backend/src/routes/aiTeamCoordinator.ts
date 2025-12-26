/**
 * AI Team Coordinator API Routes
 * Admin-only endpoints for managing autonomous AI agent coordination
 */

import express from "express";
import { aiTeamCoordinator } from "../ai/aiTeamCoordinator";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = express.Router();

// ============================================================================
// AI TEAM COORDINATOR CONTROL ROUTES
// ============================================================================

/**
 * POST /api/ai-team/start
 * Start autonomous AI team coordination
 */
router.post("/start", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await aiTeamCoordinator.startAutonomousMode();

    res.json({
      success: true,
      message: "AI Team Coordinator started in autonomous mode",
    });
  } catch (error) {
    console.error("Failed to start AI Team Coordinator:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start AI Team Coordinator",
    });
  }
});

/**
 * POST /api/ai-team/stop
 * Stop autonomous AI team coordination
 */
router.post("/stop", authenticateToken, requireAdmin, async (req, res) => {
  try {
    aiTeamCoordinator.stopAutonomousMode();

    res.json({
      success: true,
      message: "AI Team Coordinator stopped",
    });
  } catch (error) {
    console.error("Failed to stop AI Team Coordinator:", error);
    res.status(500).json({
      success: false,
      error: "Failed to stop AI Team Coordinator",
    });
  }
});

/**
 * GET /api/ai-team/status
 * Get current status of AI team coordination
 */
router.get("/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const status = aiTeamCoordinator.getStatus();

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error("Failed to get AI Team Coordinator status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get status",
    });
  }
});

/**
 * GET /api/ai-team/pending-approvals
 * Get jobs awaiting admin approval
 */
router.get("/pending-approvals", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingJobs = aiTeamCoordinator.getPendingApprovals();

    res.json({
      success: true,
      pendingApprovals: pendingJobs,
      count: pendingJobs.length,
    });
  } catch (error) {
    console.error("Failed to get pending approvals:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get pending approvals",
    });
  }
});

/**
 * POST /api/ai-team/approve-job
 * Approve a job that requires human approval
 */
router.post("/approve-job", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { jobId } = req.body;
    const adminId = (req as any).user.id;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: "Job ID required",
      });
    }

    const approved = await aiTeamCoordinator.approveJob(jobId, adminId);

    if (!approved) {
      return res.status(404).json({
        success: false,
        error: "Job not found or does not require approval",
      });
    }

    res.json({
      success: true,
      message: `Job ${jobId} approved`,
    });
  } catch (error) {
    console.error("Failed to approve job:", error);
    res.status(500).json({
      success: false,
      error: "Failed to approve job",
    });
  }
});

/**
 * POST /api/ai-team/schedule-job
 * Manually schedule a job for AI agents
 */
router.post("/schedule-job", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, priority, description, requiresApproval, metadata } = req.body;

    if (!type || !priority || !description) {
      return res.status(400).json({
        success: false,
        error: "Type, priority, and description required",
      });
    }

    const jobId = await aiTeamCoordinator.scheduleJob({
      type,
      priority,
      description,
      requiresApproval: requiresApproval || false,
      metadata,
    });

    res.json({
      success: true,
      jobId,
      message: "Job scheduled successfully",
    });
  } catch (error) {
    console.error("Failed to schedule job:", error);
    res.status(500).json({
      success: false,
      error: "Failed to schedule job",
    });
  }
});

export default router;

/**
 * SYSTEM HEALTH MONITOR
 * Prevents overheating and system malfunction
 * Internal monitoring only
 */

import os from 'os';
import { EventEmitter } from 'events';

export interface SystemHealth {
  cpu: {
    usage: number;
    loadAverage: number[];
    temperature: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  uptime: number;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'critical' | 'cooling';
}

export class SystemMonitor extends EventEmitter {
  private coolingMode = false;
  private readonly CPU_WARNING_THRESHOLD = 70;
  private readonly CPU_CRITICAL_THRESHOLD = 85;
  private readonly MEMORY_WARNING_THRESHOLD = 80;
  private readonly MEMORY_CRITICAL_THRESHOLD = 90;
  private readonly CHECK_INTERVAL = 5000;
  private monitoringInterval?: NodeJS.Timeout;

  startMonitoring(): void {
    console.log('[SYSTEM MONITOR] Starting health monitoring...');
    this.monitoringInterval = setInterval(() => {
      const health = this.getSystemHealth();
      this.checkThresholds(health);
    }, this.CHECK_INTERVAL);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  getSystemHealth(): SystemHealth {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    let totalIdle = 0;
    let totalTick = 0;
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });
    const cpuUsage = 100 - ~~(100 * totalIdle / totalTick);

    let status: SystemHealth['status'] = 'healthy';
    if (this.coolingMode) {
      status = 'cooling';
    } else if (cpuUsage >= this.CPU_CRITICAL_THRESHOLD || memoryPercentage >= this.MEMORY_CRITICAL_THRESHOLD) {
      status = 'critical';
    } else if (cpuUsage >= this.CPU_WARNING_THRESHOLD || memoryPercentage >= this.MEMORY_WARNING_THRESHOLD) {
      status = 'warning';
    }

    return {
      cpu: {
        usage: cpuUsage,
        loadAverage: os.loadavg(),
        temperature: this.getCPUTemperatureStatus(cpuUsage),
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        percentage: memoryPercentage,
      },
      uptime: os.uptime(),
      timestamp: new Date(),
      status,
    };
  }

  private getCPUTemperatureStatus(usage: number): string {
    if (usage < 50) return 'cool';
    if (usage < 70) return 'warm';
    if (usage < 85) return 'hot';
    return 'critical';
  }

  private checkThresholds(health: SystemHealth): void {
    const { cpu, memory, status } = health;

    if (status === 'critical') {
      console.error('[SYSTEM] 🚨 CRITICAL: Overheating detected!');
      console.error(`CPU: ${cpu.usage.toFixed(2)}%, Memory: ${memory.percentage.toFixed(2)}%`);
      this.activateCoolingMode();
      this.emit('critical', health);
    } else if (status === 'warning') {
      console.warn('[SYSTEM] ⚠️  WARNING: High resource usage');
      this.emit('warning', health);
    } else if (status === 'cooling') {
      this.checkCoolingComplete(health);
    } else {
      if (this.coolingMode) {
        this.deactivateCoolingMode();
      }
    }
  }

  activateCoolingMode(): void {
    if (!this.coolingMode) {
      this.coolingMode = true;
      console.log('[SYSTEM] 🧊 COOLING MODE ACTIVATED');
      this.emit('cooling-start');
    }
  }

  deactivateCoolingMode(): void {
    if (this.coolingMode) {
      this.coolingMode = false;
      console.log('[SYSTEM] ✅ System cooled - resuming normal operations');
      this.emit('cooling-end');
    }
  }

  private checkCoolingComplete(health: SystemHealth): void {
    const { cpu, memory } = health;
    if (cpu.usage < this.CPU_WARNING_THRESHOLD - 10 && 
        memory.percentage < this.MEMORY_WARNING_THRESHOLD - 10) {
      this.deactivateCoolingMode();
    }
  }

  isCoolingMode(): boolean {
    return this.coolingMode;
  }

  getStatus(): string {
    return this.getSystemHealth().status;
  }
}

export const systemMonitor = new SystemMonitor();

-- CreateTable
CREATE TABLE "RPAExecution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "trigger" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "RPAExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RPAWorkflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "RPAWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_login_logs" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_portfolios" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_settings" (
    "id" TEXT NOT NULL,
    "btcAddress" TEXT,
    "ethAddress" TEXT,
    "usdtAddress" TEXT,
    "ltcAddress" TEXT,
    "otherAddresses" TEXT,
    "exchangeRateBtc" DECIMAL(65,30),
    "exchangeRateEth" DECIMAL(65,30),
    "exchangeRateUsdt" DECIMAL(65,30),
    "processingFeePercent" DECIMAL(65,30) NOT NULL DEFAULT 2.5,
    "minPurchaseAmount" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "debitCardPriceUSD" DECIMAL(65,30) NOT NULL DEFAULT 1000,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_transfers" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "userId" TEXT,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "note" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_generations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "output" TEXT,
    "imageUrl" TEXT,
    "metadata" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRotated" TIMESTAMP(3),

    CONSTRAINT "ai_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "accuracy" DECIMAL(65,30),
    "precision" DECIMAL(65,30),
    "recall" DECIMAL(65,30),
    "f1Score" DECIMAL(65,30),
    "trainingSamples" INTEGER NOT NULL DEFAULT 0,
    "modelPath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "trainedBy" TEXT,
    "trainedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_suggestions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "dismissed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_training_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "label" BOOLEAN NOT NULL,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_training_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "textGenerations" INTEGER NOT NULL DEFAULT 0,
    "codeGenerations" INTEGER NOT NULL DEFAULT 0,
    "imageGenerations" INTEGER NOT NULL DEFAULT 0,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "costUSD" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "ai_usage_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "policies" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "changes" JSONB,
    "previousValues" JSONB,
    "newValues" JSONB,
    "details" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "severity" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_verifications" (
    "id" TEXT NOT NULL,
    "manifest_hash" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "tx_hash" TEXT,
    "record_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "blockchain" TEXT NOT NULL DEFAULT 'polygon',
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blockchain_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_detections" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "isBot" BOOLEAN NOT NULL,
    "confidence" DECIMAL(65,30) NOT NULL,
    "riskScore" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "signals" JSONB,
    "action" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_detections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderId" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedAdminId" TEXT,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "click_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventName" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "isRobot" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DECIMAL(65,30),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "click_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codebase_index" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT,
    "lastIndexed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codebase_index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_alerts" (
    "id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "user_id" TEXT,
    "transaction_id" TEXT,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assigned_to" TEXT,
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "compliance_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_logs" (
    "id" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "user_id" TEXT,
    "payment_id" TEXT,
    "payload" JSONB NOT NULL,
    "compliance_result" JSONB NOT NULL,
    "processor" TEXT,
    "risk_score" DECIMAL(65,30),
    "violations" JSONB,
    "auto_corrected" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_messages" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "symptoms" TEXT,
    "diagnosis" TEXT,
    "prescription" TEXT,
    "notes" TEXT,
    "videoRoomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copilot_feedback" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "copilot_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copilot_interactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "copilot_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copilot_tasks" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "context" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "copilot_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crisis_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "indicators" JSONB NOT NULL,
    "actions" JSONB,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crisis_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cryptoType" TEXT NOT NULL,
    "usdAmount" DECIMAL(65,30) NOT NULL,
    "cryptoAmount" DECIMAL(65,30) NOT NULL,
    "exchangeRate" DECIMAL(65,30) NOT NULL,
    "processingFee" DECIMAL(65,30) NOT NULL,
    "totalUsd" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminAddress" TEXT NOT NULL,
    "txHash" TEXT,
    "adminNotes" TEXT,
    "userWalletAddress" TEXT,
    "stripeSessionId" TEXT,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_withdrawals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cryptoType" TEXT NOT NULL,
    "cryptoAmount" DECIMAL(65,30) NOT NULL,
    "usdEquivalent" DECIMAL(65,30) NOT NULL,
    "withdrawalAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminApprovedBy" TEXT,
    "adminNotes" TEXT,
    "txHash" TEXT,
    "networkFee" DECIMAL(65,30),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debit_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "cardHolderName" TEXT NOT NULL,
    "expiryMonth" INTEGER NOT NULL,
    "expiryYear" INTEGER NOT NULL,
    "cvv" TEXT NOT NULL,
    "cardType" TEXT NOT NULL DEFAULT 'virtual',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dailyLimit" DECIMAL(65,30) NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debit_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eth_activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "address" TEXT NOT NULL,
    "addressNormalized" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "txHash" TEXT,
    "amountEth" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "blockNumber" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eth_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT,
    "score" DECIMAL(65,30) NOT NULL,
    "factors" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_readings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "heartRate" INTEGER,
    "bloodPressureSys" INTEGER,
    "bloodPressureDia" INTEGER,
    "steps" INTEGER,
    "sleepHours" DECIMAL(65,30),
    "sleepQuality" TEXT,
    "weight" DECIMAL(65,30),
    "temperature" DECIMAL(65,30),
    "oxygenLevel" INTEGER,
    "stressLevel" TEXT,
    "mood" TEXT,
    "deviceId" TEXT,
    "deviceType" TEXT,
    "metadata" TEXT,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_blocks" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "reason" TEXT,
    "until" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jurisdiction_rules" (
    "id" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "regulators" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "allowed_processors" TEXT NOT NULL,
    "restricted_countries" TEXT NOT NULL,
    "compliance_level" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jurisdiction_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "interestRate" DECIMAL(65,30) NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "monthlyPayment" DECIMAL(65,30) NOT NULL,
    "remainingBalance" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "purpose" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidOffAt" TIMESTAMP(3),
    "defaultedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_intelligence" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "sentiment" TEXT,
    "importance" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medbeds_bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chamberType" TEXT NOT NULL,
    "chamberName" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "transactionId" TEXT,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "effectiveness" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medbeds_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "transactionAlerts" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "rewardAlerts" BOOLEAN NOT NULL DEFAULT true,
    "adminAlerts" BOOLEAN NOT NULL DEFAULT true,
    "promotionalEmails" BOOLEAN NOT NULL DEFAULT false,
    "enableDigest" BOOLEAN NOT NULL DEFAULT false,
    "digestFrequency" TEXT NOT NULL DEFAULT 'daily',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "smsSent" BOOLEAN NOT NULL DEFAULT false,
    "smsSentAt" TIMESTAMP(3),
    "pushSent" BOOLEAN NOT NULL DEFAULT false,
    "pushSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oal_audit_log" (
    "id" TEXT NOT NULL,
    "object" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "subjectId" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oal_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processor_configs" (
    "id" TEXT NOT NULL,
    "processor_id" TEXT NOT NULL,
    "processor_name" TEXT NOT NULL,
    "jurisdictions" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "fees" JSONB NOT NULL,
    "settlement_time_days" INTEGER NOT NULL,
    "max_amount" DECIMAL(65,30) NOT NULL,
    "rating" DECIMAL(65,30) NOT NULL DEFAULT 0.80,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "api_credentials" JSONB,
    "last_health_check" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processor_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "deviceInfo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "expiresAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "risk_score" DECIMAL(65,30) NOT NULL,
    "risk_level" TEXT NOT NULL,
    "risk_factors" JSONB NOT NULL,
    "assessment_reason" TEXT,
    "adaptive_policy_applied" BOOLEAN NOT NULL DEFAULT false,
    "assessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scam_addresses" (
    "address" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scam_addresses_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "security_patches" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "vulnerability" TEXT NOT NULL,
    "fix" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "applied_by" TEXT,
    "applied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_patches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "response" TEXT,
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_alerts" (
    "id" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "serviceName" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_status" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" INTEGER,
    "uptime" DECIMAL(65,30),
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusMessage" TEXT,
    "alertLevel" TEXT NOT NULL DEFAULT 'none',
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "description" TEXT,
    "toAddress" TEXT,
    "fromAddress" TEXT,
    "txHash" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tokenType" TEXT NOT NULL DEFAULT 'ADVANCIA',
    "lockedBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lifetimeEarned" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploaded_files" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'documents',
    "filename" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT,
    "size" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "user_id" TEXT NOT NULL,
    "dashboard_layout" JSONB,
    "features" JSONB,
    "suggestions" JSONB,
    "interaction_log" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_tiers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentTier" TEXT NOT NULL DEFAULT 'bronze',
    "points" INTEGER NOT NULL DEFAULT 0,
    "lifetimePoints" INTEGER NOT NULL DEFAULT 0,
    "lifetimeRewards" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "achievements" TEXT,
    "badges" TEXT,
    "referralCode" TEXT,
    "referredBy" TEXT,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "usdBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" TIMESTAMP(3),
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "totpVerified" BOOLEAN NOT NULL DEFAULT false,
    "backupCodes" TEXT,
    "ethWalletAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "btcBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "ethBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "usdtBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "googleId" TEXT,
    "profilePicture" TEXT,
    "blockedAt" TIMESTAMP(3),
    "blockedReason" TEXT,
    "blockedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "approvedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "secret_key" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "mfa_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "vault_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_secrets" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "encrypted_value" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "rotationPolicy" JSONB,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_rotated" TIMESTAMP(3),

    CONSTRAINT "vault_secrets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "cronSchedule" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "aiModel" TEXT NOT NULL DEFAULT 'gpt-4',
    "config" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tasks" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "executionId" TEXT,
    "taskType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input" TEXT NOT NULL,
    "aiSuggestion" TEXT,
    "aiReasoning" TEXT,
    "aiConfidence" DECIMAL(65,30) DEFAULT 0,
    "output" TEXT,
    "error" TEXT,
    "executionTimeMs" INTEGER,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvalStatus" TEXT,
    "humanFeedback" TEXT,
    "humanModification" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "scheduledFor" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workflow_executions" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "triggeredBy" TEXT NOT NULL,
    "triggerData" TEXT,
    "tasksTotal" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "tasksFailed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "error" TEXT,

    CONSTRAINT "ai_workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_learning" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "aiSuggestion" TEXT NOT NULL,
    "humanDecision" TEXT NOT NULL,
    "humanModification" TEXT,
    "feedback" TEXT,
    "wasCorrect" BOOLEAN,
    "outcomeNotes" TEXT,
    "context" TEXT NOT NULL,
    "patterns" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_learning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_monitoring_alerts" (
    "id" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detectedBy" TEXT NOT NULL DEFAULT 'ai_monitor',
    "aiAnalysis" TEXT,
    "aiSuggestion" TEXT,
    "aiConfidence" DECIMAL(65,30) DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assignedTo" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_monitoring_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_monitoring_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastCheck" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_monitoring_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_alerts" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_reports" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'markdown',
    "generatedBy" TEXT NOT NULL DEFAULT 'ai_core',
    "aiModel" TEXT NOT NULL DEFAULT 'gpt-4',
    "dataFrom" TIMESTAMP(3) NOT NULL,
    "dataTo" TIMESTAMP(3) NOT NULL,
    "dataSources" TEXT NOT NULL,
    "insights" TEXT,
    "recommendations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "recipients" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "priceMonthly" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "priceYearly" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripePriceIdMonthly" TEXT,
    "stripePriceIdYearly" TEXT,
    "stripeProductId" TEXT,
    "aiRequestsPerDay" INTEGER NOT NULL DEFAULT 50,
    "aiRequestsPerMonth" INTEGER NOT NULL DEFAULT 1500,
    "storageGb" INTEGER NOT NULL DEFAULT 1,
    "maxTeamMembers" INTEGER NOT NULL DEFAULT 1,
    "features" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "badge" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountDue" DECIMAL(65,30) NOT NULL,
    "amountPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "stripeInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "hostedInvoiceUrl" TEXT,
    "invoicePdfUrl" TEXT,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "lineItems" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(65,30),
    "totalPrice" DECIMAL(65,30),
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "billed" BOOLEAN NOT NULL DEFAULT false,
    "billedAt" TIMESTAMP(3),
    "invoiceId" TEXT,
    "stripeUsageRecordId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_quotas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiRequestsToday" INTEGER NOT NULL DEFAULT 0,
    "aiRequestsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "dailyLimit" INTEGER NOT NULL DEFAULT 50,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 1500,
    "lastDailyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMonthlyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overageAllowed" BOOLEAN NOT NULL DEFAULT false,
    "overageRate" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_usage_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "contentMarkdown" TEXT NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "canonicalUrl" TEXT,
    "structuredData" TEXT,
    "readTimeMinutes" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiModel" TEXT,
    "aiPrompt" TEXT,
    "aiJobId" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_media" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "caption" TEXT,
    "s3Key" TEXT,
    "cdnUrl" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiPrompt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_audits" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "url" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "technicalScore" INTEGER NOT NULL,
    "contentScore" INTEGER NOT NULL,
    "mobileFriendly" BOOLEAN NOT NULL,
    "pageSpeed" INTEGER,
    "missingMetaTags" TEXT,
    "brokenLinks" TEXT,
    "missingAltText" TEXT,
    "keywordIssues" TEXT,
    "suggestions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "seo_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitemaps" (
    "id" TEXT NOT NULL,
    "urls" TEXT NOT NULL,
    "totalUrls" INTEGER NOT NULL,
    "generated" BOOLEAN NOT NULL DEFAULT false,
    "generatedAt" TIMESTAMP(3),
    "submitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sitemaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "vaultKeyAccess" TEXT NOT NULL,
    "vaultKeyRefresh" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "profileImageUrl" TEXT,
    "followerCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_media_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_posts" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT,
    "accountId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT,
    "hashtags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "platformPostId" TEXT,
    "platformUrl" TEXT,
    "errorMessage" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "lastSyncedAt" TIMESTAMP(3),
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_media_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" DOUBLE PRECISION,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sprintId" TEXT,
    "boardId" TEXT,
    "columnId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "assigneeId" TEXT,
    "reporterId" TEXT NOT NULL,
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiSuggestions" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_dependencies" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dependsOnTaskId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BLOCKS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprints" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "velocity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_boards" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_columns" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "limit" INTEGER,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_attachments" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tags" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_tags" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "data" TEXT,
    "result" TEXT,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "delay" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "currency" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "balance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_deposits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "txHash" TEXT,
    "status" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "momIncidentId" TEXT,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "currency" TEXT NOT NULL,
    "txHash" TEXT,
    "actorId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crypto_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_crypto_balances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "balance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_crypto_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceUSD" DECIMAL(18,2) NOT NULL,
    "intervalMonths" INTEGER NOT NULL DEFAULT 1,
    "features" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "stripePaymentMethodId" TEXT,
    "last4" TEXT,
    "brand" TEXT,
    "walletAddress" TEXT,
    "cryptoCurrency" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "paymentMethodId" TEXT,
    "amountUSD" DECIMAL(18,2) NOT NULL,
    "amountCrypto" DECIMAL(18,8),
    "cryptoCurrency" TEXT,
    "provider" TEXT NOT NULL,
    "providerTransactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "type" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeInvoiceId" TEXT,
    "walletAddress" TEXT,
    "txHash" TEXT,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_price_data" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "priceUSD" DECIMAL(18,8) NOT NULL,
    "change24h" DECIMAL(8,4),
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'coinbase',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crypto_price_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "processingResult" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "payload" TEXT NOT NULL,
    "signature" TEXT,
    "transactionId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RPAExecution_workflowId_idx" ON "RPAExecution"("workflowId");

-- CreateIndex
CREATE INDEX "RPAExecution_status_idx" ON "RPAExecution"("status");

-- CreateIndex
CREATE INDEX "RPAExecution_startedAt_idx" ON "RPAExecution"("startedAt");

-- CreateIndex
CREATE INDEX "RPAWorkflow_enabled_idx" ON "RPAWorkflow"("enabled");

-- CreateIndex
CREATE INDEX "RPAWorkflow_createdById_idx" ON "RPAWorkflow"("createdById");

-- CreateIndex
CREATE INDEX "admin_login_logs_createdAt_idx" ON "admin_login_logs"("createdAt");

-- CreateIndex
CREATE INDEX "admin_login_logs_status_idx" ON "admin_login_logs"("status");

-- CreateIndex
CREATE INDEX "admin_login_logs_email_idx" ON "admin_login_logs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_portfolios_currency_key" ON "admin_portfolios"("currency");

-- CreateIndex
CREATE INDEX "admin_transfers_userId_idx" ON "admin_transfers"("userId");

-- CreateIndex
CREATE INDEX "admin_transfers_createdAt_idx" ON "admin_transfers"("createdAt");

-- CreateIndex
CREATE INDEX "admin_transfers_currency_idx" ON "admin_transfers"("currency");

-- CreateIndex
CREATE INDEX "ai_generations_createdAt_idx" ON "ai_generations"("createdAt");

-- CreateIndex
CREATE INDEX "ai_generations_status_idx" ON "ai_generations"("status");

-- CreateIndex
CREATE INDEX "ai_generations_type_idx" ON "ai_generations"("type");

-- CreateIndex
CREATE INDEX "ai_generations_userId_idx" ON "ai_generations"("userId");

-- CreateIndex
CREATE INDEX "ai_models_isActive_idx" ON "ai_models"("isActive");

-- CreateIndex
CREATE INDEX "ai_models_modelType_idx" ON "ai_models"("modelType");

-- CreateIndex
CREATE INDEX "ai_suggestions_created_at_idx" ON "ai_suggestions"("created_at");

-- CreateIndex
CREATE INDEX "ai_suggestions_type_idx" ON "ai_suggestions"("type");

-- CreateIndex
CREATE INDEX "ai_suggestions_user_id_idx" ON "ai_suggestions"("user_id");

-- CreateIndex
CREATE INDEX "ai_training_data_createdAt_idx" ON "ai_training_data"("createdAt");

-- CreateIndex
CREATE INDEX "ai_training_data_verifiedBy_idx" ON "ai_training_data"("verifiedBy");

-- CreateIndex
CREATE INDEX "ai_training_data_label_idx" ON "ai_training_data"("label");

-- CreateIndex
CREATE INDEX "ai_usage_metrics_date_idx" ON "ai_usage_metrics"("date");

-- CreateIndex
CREATE INDEX "ai_usage_metrics_userId_idx" ON "ai_usage_metrics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_usage_metrics_userId_date_key" ON "ai_usage_metrics"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "app_roles_name_key" ON "app_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "app_roles_token_key" ON "app_roles"("token");

-- CreateIndex
CREATE INDEX "app_roles_expires_at_idx" ON "app_roles"("expires_at");

-- CreateIndex
CREATE INDEX "app_roles_token_idx" ON "app_roles"("token");

-- CreateIndex
CREATE INDEX "app_roles_name_idx" ON "app_roles"("name");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_resourceId_idx" ON "audit_logs"("resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_resourceType_idx" ON "audit_logs"("resourceType");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_adminId_idx" ON "audit_logs"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "backup_codes_code_key" ON "backup_codes"("code");

-- CreateIndex
CREATE INDEX "backup_codes_isUsed_idx" ON "backup_codes"("isUsed");

-- CreateIndex
CREATE INDEX "backup_codes_code_idx" ON "backup_codes"("code");

-- CreateIndex
CREATE INDEX "backup_codes_userId_idx" ON "backup_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_verifications_tx_hash_key" ON "blockchain_verifications"("tx_hash");

-- CreateIndex
CREATE INDEX "blockchain_verifications_created_at_idx" ON "blockchain_verifications"("created_at");

-- CreateIndex
CREATE INDEX "blockchain_verifications_version_idx" ON "blockchain_verifications"("version");

-- CreateIndex
CREATE INDEX "blockchain_verifications_status_idx" ON "blockchain_verifications"("status");

-- CreateIndex
CREATE INDEX "bot_detections_createdAt_idx" ON "bot_detections"("createdAt");

-- CreateIndex
CREATE INDEX "bot_detections_isBot_idx" ON "bot_detections"("isBot");

-- CreateIndex
CREATE INDEX "bot_detections_ipAddress_idx" ON "bot_detections"("ipAddress");

-- CreateIndex
CREATE INDEX "bot_detections_userId_idx" ON "bot_detections"("userId");

-- CreateIndex
CREATE INDEX "click_events_createdAt_idx" ON "click_events"("createdAt");

-- CreateIndex
CREATE INDEX "click_events_isRobot_idx" ON "click_events"("isRobot");

-- CreateIndex
CREATE INDEX "click_events_eventName_idx" ON "click_events"("eventName");

-- CreateIndex
CREATE INDEX "click_events_userId_idx" ON "click_events"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "codebase_index_filePath_key" ON "codebase_index"("filePath");

-- CreateIndex
CREATE INDEX "codebase_index_lastIndexed_idx" ON "codebase_index"("lastIndexed");

-- CreateIndex
CREATE INDEX "codebase_index_filePath_idx" ON "codebase_index"("filePath");

-- CreateIndex
CREATE INDEX "compliance_alerts_created_at_idx" ON "compliance_alerts"("created_at");

-- CreateIndex
CREATE INDEX "compliance_alerts_user_id_idx" ON "compliance_alerts"("user_id");

-- CreateIndex
CREATE INDEX "compliance_alerts_severity_idx" ON "compliance_alerts"("severity");

-- CreateIndex
CREATE INDEX "compliance_alerts_status_idx" ON "compliance_alerts"("status");

-- CreateIndex
CREATE INDEX "compliance_logs_processor_idx" ON "compliance_logs"("processor");

-- CreateIndex
CREATE INDEX "compliance_logs_timestamp_idx" ON "compliance_logs"("timestamp");

-- CreateIndex
CREATE INDEX "compliance_logs_user_id_idx" ON "compliance_logs"("user_id");

-- CreateIndex
CREATE INDEX "compliance_logs_event_type_idx" ON "compliance_logs"("event_type");

-- CreateIndex
CREATE INDEX "compliance_logs_jurisdiction_idx" ON "compliance_logs"("jurisdiction");

-- CreateIndex
CREATE INDEX "copilot_feedback_rating_idx" ON "copilot_feedback"("rating");

-- CreateIndex
CREATE INDEX "copilot_feedback_userId_idx" ON "copilot_feedback"("userId");

-- CreateIndex
CREATE INDEX "copilot_feedback_taskId_idx" ON "copilot_feedback"("taskId");

-- CreateIndex
CREATE INDEX "copilot_interactions_timestamp_idx" ON "copilot_interactions"("timestamp");

-- CreateIndex
CREATE INDEX "copilot_interactions_sessionId_idx" ON "copilot_interactions"("sessionId");

-- CreateIndex
CREATE INDEX "copilot_interactions_userId_idx" ON "copilot_interactions"("userId");

-- CreateIndex
CREATE INDEX "copilot_tasks_createdAt_idx" ON "copilot_tasks"("createdAt");

-- CreateIndex
CREATE INDEX "copilot_tasks_type_idx" ON "copilot_tasks"("type");

-- CreateIndex
CREATE INDEX "copilot_tasks_status_idx" ON "copilot_tasks"("status");

-- CreateIndex
CREATE INDEX "crisis_events_created_at_idx" ON "crisis_events"("created_at");

-- CreateIndex
CREATE INDEX "crisis_events_severity_idx" ON "crisis_events"("severity");

-- CreateIndex
CREATE INDEX "crisis_events_type_idx" ON "crisis_events"("type");

-- CreateIndex
CREATE INDEX "crypto_orders_createdAt_idx" ON "crypto_orders"("createdAt");

-- CreateIndex
CREATE INDEX "crypto_orders_cryptoType_idx" ON "crypto_orders"("cryptoType");

-- CreateIndex
CREATE INDEX "crypto_orders_status_idx" ON "crypto_orders"("status");

-- CreateIndex
CREATE INDEX "crypto_orders_userId_idx" ON "crypto_orders"("userId");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_createdAt_idx" ON "crypto_withdrawals"("createdAt");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_cryptoType_idx" ON "crypto_withdrawals"("cryptoType");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_status_idx" ON "crypto_withdrawals"("status");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_userId_idx" ON "crypto_withdrawals"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "debit_cards_cardNumber_key" ON "debit_cards"("cardNumber");

-- CreateIndex
CREATE INDEX "debit_cards_status_idx" ON "debit_cards"("status");

-- CreateIndex
CREATE INDEX "debit_cards_cardNumber_idx" ON "debit_cards"("cardNumber");

-- CreateIndex
CREATE INDEX "debit_cards_userId_idx" ON "debit_cards"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "eth_activity_txHash_key" ON "eth_activity"("txHash");

-- CreateIndex
CREATE INDEX "eth_activity_createdAt_idx" ON "eth_activity"("createdAt");

-- CreateIndex
CREATE INDEX "eth_activity_type_idx" ON "eth_activity"("type");

-- CreateIndex
CREATE INDEX "eth_activity_addressNormalized_idx" ON "eth_activity"("addressNormalized");

-- CreateIndex
CREATE INDEX "fraud_scores_status_idx" ON "fraud_scores"("status");

-- CreateIndex
CREATE INDEX "fraud_scores_score_idx" ON "fraud_scores"("score");

-- CreateIndex
CREATE INDEX "fraud_scores_transactionId_idx" ON "fraud_scores"("transactionId");

-- CreateIndex
CREATE INDEX "fraud_scores_userId_idx" ON "fraud_scores"("userId");

-- CreateIndex
CREATE INDEX "health_readings_createdAt_idx" ON "health_readings"("createdAt");

-- CreateIndex
CREATE INDEX "health_readings_recordedAt_idx" ON "health_readings"("recordedAt");

-- CreateIndex
CREATE INDEX "health_readings_userId_idx" ON "health_readings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ip_blocks_ip_key" ON "ip_blocks"("ip");

-- CreateIndex
CREATE INDEX "ip_blocks_updatedAt_idx" ON "ip_blocks"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "jurisdiction_rules_jurisdiction_key" ON "jurisdiction_rules"("jurisdiction");

-- CreateIndex
CREATE INDEX "jurisdiction_rules_compliance_level_idx" ON "jurisdiction_rules"("compliance_level");

-- CreateIndex
CREATE INDEX "jurisdiction_rules_enabled_idx" ON "jurisdiction_rules"("enabled");

-- CreateIndex
CREATE INDEX "loans_createdAt_idx" ON "loans"("createdAt");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE INDEX "loans_userId_idx" ON "loans"("userId");

-- CreateIndex
CREATE INDEX "market_intelligence_sentiment_idx" ON "market_intelligence"("sentiment");

-- CreateIndex
CREATE INDEX "market_intelligence_source_idx" ON "market_intelligence"("source");

-- CreateIndex
CREATE INDEX "market_intelligence_created_at_category_idx" ON "market_intelligence"("created_at", "category");

-- CreateIndex
CREATE INDEX "medbeds_bookings_paymentStatus_idx" ON "medbeds_bookings"("paymentStatus");

-- CreateIndex
CREATE INDEX "medbeds_bookings_status_idx" ON "medbeds_bookings"("status");

-- CreateIndex
CREATE INDEX "medbeds_bookings_sessionDate_idx" ON "medbeds_bookings"("sessionDate");

-- CreateIndex
CREATE INDEX "medbeds_bookings_userId_idx" ON "medbeds_bookings"("userId");

-- CreateIndex
CREATE INDEX "notification_logs_channel_idx" ON "notification_logs"("channel");

-- CreateIndex
CREATE INDEX "notification_logs_sentAt_idx" ON "notification_logs"("sentAt");

-- CreateIndex
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");

-- CreateIndex
CREATE INDEX "notification_logs_notificationId_idx" ON "notification_logs"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_category_idx" ON "notifications"("category");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "oal_audit_log_createdAt_idx" ON "oal_audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "oal_audit_log_subjectId_idx" ON "oal_audit_log"("subjectId");

-- CreateIndex
CREATE INDEX "oal_audit_log_createdById_idx" ON "oal_audit_log"("createdById");

-- CreateIndex
CREATE INDEX "oal_audit_log_status_idx" ON "oal_audit_log"("status");

-- CreateIndex
CREATE INDEX "oal_audit_log_location_idx" ON "oal_audit_log"("location");

-- CreateIndex
CREATE INDEX "oal_audit_log_action_idx" ON "oal_audit_log"("action");

-- CreateIndex
CREATE INDEX "oal_audit_log_object_idx" ON "oal_audit_log"("object");

-- CreateIndex
CREATE UNIQUE INDEX "processor_configs_processor_id_key" ON "processor_configs"("processor_id");

-- CreateIndex
CREATE INDEX "processor_configs_processor_id_idx" ON "processor_configs"("processor_id");

-- CreateIndex
CREATE INDEX "processor_configs_enabled_idx" ON "processor_configs"("enabled");

-- CreateIndex
CREATE INDEX "push_subscriptions_isActive_idx" ON "push_subscriptions"("isActive");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_userId_endpoint_key" ON "push_subscriptions"("userId", "endpoint");

-- CreateIndex
CREATE INDEX "rewards_createdAt_idx" ON "rewards"("createdAt");

-- CreateIndex
CREATE INDEX "rewards_type_idx" ON "rewards"("type");

-- CreateIndex
CREATE INDEX "rewards_status_idx" ON "rewards"("status");

-- CreateIndex
CREATE INDEX "rewards_userId_idx" ON "rewards"("userId");

-- CreateIndex
CREATE INDEX "risk_assessments_expires_at_idx" ON "risk_assessments"("expires_at");

-- CreateIndex
CREATE INDEX "risk_assessments_assessed_at_idx" ON "risk_assessments"("assessed_at");

-- CreateIndex
CREATE INDEX "risk_assessments_risk_level_idx" ON "risk_assessments"("risk_level");

-- CreateIndex
CREATE INDEX "risk_assessments_user_id_idx" ON "risk_assessments"("user_id");

-- CreateIndex
CREATE INDEX "scam_addresses_category_idx" ON "scam_addresses"("category");

-- CreateIndex
CREATE INDEX "scam_addresses_blockchain_severity_idx" ON "scam_addresses"("blockchain", "severity");

-- CreateIndex
CREATE INDEX "security_patches_created_at_idx" ON "security_patches"("created_at");

-- CreateIndex
CREATE INDEX "security_patches_type_idx" ON "security_patches"("type");

-- CreateIndex
CREATE INDEX "security_patches_status_idx" ON "security_patches"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_userId_idx" ON "support_tickets"("userId");

-- CreateIndex
CREATE INDEX "system_alerts_createdAt_idx" ON "system_alerts"("createdAt");

-- CreateIndex
CREATE INDEX "system_alerts_isResolved_idx" ON "system_alerts"("isResolved");

-- CreateIndex
CREATE INDEX "system_alerts_severity_idx" ON "system_alerts"("severity");

-- CreateIndex
CREATE INDEX "system_alerts_alertType_idx" ON "system_alerts"("alertType");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE INDEX "system_status_lastChecked_idx" ON "system_status"("lastChecked");

-- CreateIndex
CREATE INDEX "system_status_alertLevel_idx" ON "system_status"("alertLevel");

-- CreateIndex
CREATE INDEX "system_status_status_idx" ON "system_status"("status");

-- CreateIndex
CREATE INDEX "system_status_serviceName_idx" ON "system_status"("serviceName");

-- CreateIndex
CREATE INDEX "token_transactions_status_idx" ON "token_transactions"("status");

-- CreateIndex
CREATE INDEX "token_transactions_type_idx" ON "token_transactions"("type");

-- CreateIndex
CREATE INDEX "token_transactions_createdAt_idx" ON "token_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "token_transactions_walletId_idx" ON "token_transactions"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "token_wallets_userId_key" ON "token_wallets"("userId");

-- CreateIndex
CREATE INDEX "token_wallets_userId_idx" ON "token_wallets"("userId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "uploaded_files_key_key" ON "uploaded_files"("key");

-- CreateIndex
CREATE INDEX "uploaded_files_userId_category_idx" ON "uploaded_files"("userId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tiers_userId_key" ON "user_tiers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_tiers_referralCode_key" ON "user_tiers"("referralCode");

-- CreateIndex
CREATE INDEX "user_tiers_referralCode_idx" ON "user_tiers"("referralCode");

-- CreateIndex
CREATE INDEX "user_tiers_points_idx" ON "user_tiers"("points");

-- CreateIndex
CREATE INDEX "user_tiers_currentTier_idx" ON "user_tiers"("currentTier");

-- CreateIndex
CREATE INDEX "user_tiers_userId_idx" ON "user_tiers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_ethWalletAddress_key" ON "users"("ethWalletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");

-- CreateIndex
CREATE INDEX "vault_audit_logs_timestamp_idx" ON "vault_audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "vault_audit_logs_secret_key_idx" ON "vault_audit_logs"("secret_key");

-- CreateIndex
CREATE INDEX "vault_audit_logs_action_idx" ON "vault_audit_logs"("action");

-- CreateIndex
CREATE INDEX "vault_audit_logs_user_id_idx" ON "vault_audit_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vault_secrets_key_key" ON "vault_secrets"("key");

-- CreateIndex
CREATE INDEX "vault_secrets_last_rotated_idx" ON "vault_secrets"("last_rotated");

-- CreateIndex
CREATE INDEX "vault_secrets_created_by_idx" ON "vault_secrets"("created_by");

-- CreateIndex
CREATE INDEX "vault_secrets_key_idx" ON "vault_secrets"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ai_workflows_name_key" ON "ai_workflows"("name");

-- CreateIndex
CREATE INDEX "ai_workflows_category_idx" ON "ai_workflows"("category");

-- CreateIndex
CREATE INDEX "ai_workflows_enabled_idx" ON "ai_workflows"("enabled");

-- CreateIndex
CREATE INDEX "ai_workflows_triggerType_idx" ON "ai_workflows"("triggerType");

-- CreateIndex
CREATE INDEX "ai_tasks_workflowId_idx" ON "ai_tasks"("workflowId");

-- CreateIndex
CREATE INDEX "ai_tasks_executionId_idx" ON "ai_tasks"("executionId");

-- CreateIndex
CREATE INDEX "ai_tasks_status_idx" ON "ai_tasks"("status");

-- CreateIndex
CREATE INDEX "ai_tasks_priority_idx" ON "ai_tasks"("priority");

-- CreateIndex
CREATE INDEX "ai_tasks_taskType_idx" ON "ai_tasks"("taskType");

-- CreateIndex
CREATE INDEX "ai_tasks_scheduledFor_idx" ON "ai_tasks"("scheduledFor");

-- CreateIndex
CREATE INDEX "ai_workflow_executions_workflowId_idx" ON "ai_workflow_executions"("workflowId");

-- CreateIndex
CREATE INDEX "ai_workflow_executions_status_idx" ON "ai_workflow_executions"("status");

-- CreateIndex
CREATE INDEX "ai_workflow_executions_startedAt_idx" ON "ai_workflow_executions"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_learning_taskId_key" ON "ai_learning"("taskId");

-- CreateIndex
CREATE INDEX "ai_learning_taskType_idx" ON "ai_learning"("taskType");

-- CreateIndex
CREATE INDEX "ai_learning_humanDecision_idx" ON "ai_learning"("humanDecision");

-- CreateIndex
CREATE INDEX "ai_learning_wasCorrect_idx" ON "ai_learning"("wasCorrect");

-- CreateIndex
CREATE INDEX "ai_learning_createdAt_idx" ON "ai_learning"("createdAt");

-- CreateIndex
CREATE INDEX "ai_monitoring_alerts_alertType_idx" ON "ai_monitoring_alerts"("alertType");

-- CreateIndex
CREATE INDEX "ai_monitoring_alerts_severity_idx" ON "ai_monitoring_alerts"("severity");

-- CreateIndex
CREATE INDEX "ai_monitoring_alerts_status_idx" ON "ai_monitoring_alerts"("status");

-- CreateIndex
CREATE INDEX "ai_monitoring_alerts_createdAt_idx" ON "ai_monitoring_alerts"("createdAt");

-- CreateIndex
CREATE INDEX "ai_monitoring_rules_type_idx" ON "ai_monitoring_rules"("type");

-- CreateIndex
CREATE INDEX "ai_monitoring_rules_enabled_idx" ON "ai_monitoring_rules"("enabled");

-- CreateIndex
CREATE INDEX "ai_alerts_ruleId_idx" ON "ai_alerts"("ruleId");

-- CreateIndex
CREATE INDEX "ai_alerts_status_idx" ON "ai_alerts"("status");

-- CreateIndex
CREATE INDEX "ai_alerts_severity_idx" ON "ai_alerts"("severity");

-- CreateIndex
CREATE INDEX "ai_reports_reportType_idx" ON "ai_reports"("reportType");

-- CreateIndex
CREATE INDEX "ai_reports_category_idx" ON "ai_reports"("category");

-- CreateIndex
CREATE INDEX "ai_reports_status_idx" ON "ai_reports"("status");

-- CreateIndex
CREATE INDEX "ai_reports_createdAt_idx" ON "ai_reports"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_system_config_key_key" ON "ai_system_config"("key");

-- CreateIndex
CREATE INDEX "ai_system_config_category_idx" ON "ai_system_config"("category");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_name_key" ON "pricing_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_slug_key" ON "pricing_plans"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_stripePriceIdMonthly_key" ON "pricing_plans"("stripePriceIdMonthly");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_stripePriceIdYearly_key" ON "pricing_plans"("stripePriceIdYearly");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_stripeProductId_key" ON "pricing_plans"("stripeProductId");

-- CreateIndex
CREATE INDEX "pricing_plans_isActive_idx" ON "pricing_plans"("isActive");

-- CreateIndex
CREATE INDEX "pricing_plans_displayOrder_idx" ON "pricing_plans"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_planId_idx" ON "subscriptions"("planId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_status_key" ON "subscriptions"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripeInvoiceId_key" ON "invoices"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "invoices_subscriptionId_idx" ON "invoices"("subscriptionId");

-- CreateIndex
CREATE INDEX "invoices_userId_idx" ON "invoices"("userId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_stripeInvoiceId_idx" ON "invoices"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "usage_records_subscriptionId_idx" ON "usage_records"("subscriptionId");

-- CreateIndex
CREATE INDEX "usage_records_userId_idx" ON "usage_records"("userId");

-- CreateIndex
CREATE INDEX "usage_records_resourceType_idx" ON "usage_records"("resourceType");

-- CreateIndex
CREATE INDEX "usage_records_periodStart_periodEnd_idx" ON "usage_records"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "usage_records_billed_idx" ON "usage_records"("billed");

-- CreateIndex
CREATE UNIQUE INDEX "ai_usage_quotas_userId_key" ON "ai_usage_quotas"("userId");

-- CreateIndex
CREATE INDEX "ai_usage_quotas_userId_idx" ON "ai_usage_quotas"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_name_key" ON "blog_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE INDEX "blog_categories_slug_idx" ON "blog_categories"("slug");

-- CreateIndex
CREATE INDEX "blog_categories_parentId_idx" ON "blog_categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_authorId_idx" ON "blog_posts"("authorId");

-- CreateIndex
CREATE INDEX "blog_posts_categoryId_idx" ON "blog_posts"("categoryId");

-- CreateIndex
CREATE INDEX "blog_posts_status_idx" ON "blog_posts"("status");

-- CreateIndex
CREATE INDEX "blog_posts_publishedAt_idx" ON "blog_posts"("publishedAt");

-- CreateIndex
CREATE INDEX "blog_posts_featured_idx" ON "blog_posts"("featured");

-- CreateIndex
CREATE INDEX "blog_media_postId_idx" ON "blog_media"("postId");

-- CreateIndex
CREATE INDEX "blog_media_type_idx" ON "blog_media"("type");

-- CreateIndex
CREATE INDEX "blog_comments_postId_idx" ON "blog_comments"("postId");

-- CreateIndex
CREATE INDEX "blog_comments_authorId_idx" ON "blog_comments"("authorId");

-- CreateIndex
CREATE INDEX "blog_comments_status_idx" ON "blog_comments"("status");

-- CreateIndex
CREATE INDEX "blog_comments_createdAt_idx" ON "blog_comments"("createdAt");

-- CreateIndex
CREATE INDEX "seo_audits_postId_idx" ON "seo_audits"("postId");

-- CreateIndex
CREATE INDEX "seo_audits_status_idx" ON "seo_audits"("status");

-- CreateIndex
CREATE INDEX "seo_audits_createdAt_idx" ON "seo_audits"("createdAt");

-- CreateIndex
CREATE INDEX "social_media_accounts_userId_idx" ON "social_media_accounts"("userId");

-- CreateIndex
CREATE INDEX "social_media_accounts_platform_idx" ON "social_media_accounts"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "social_media_accounts_userId_platform_accountId_key" ON "social_media_accounts"("userId", "platform", "accountId");

-- CreateIndex
CREATE INDEX "social_media_posts_accountId_idx" ON "social_media_posts"("accountId");

-- CreateIndex
CREATE INDEX "social_media_posts_blogPostId_idx" ON "social_media_posts"("blogPostId");

-- CreateIndex
CREATE INDEX "social_media_posts_status_idx" ON "social_media_posts"("status");

-- CreateIndex
CREATE INDEX "social_media_posts_scheduledFor_idx" ON "social_media_posts"("scheduledFor");

-- CreateIndex
CREATE INDEX "social_media_posts_postedAt_idx" ON "social_media_posts"("postedAt");

-- CreateIndex
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_priority_idx" ON "projects"("priority");

-- CreateIndex
CREATE INDEX "project_members_projectId_idx" ON "project_members"("projectId");

-- CreateIndex
CREATE INDEX "project_members_userId_idx" ON "project_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_projectId_userId_key" ON "project_members"("projectId", "userId");

-- CreateIndex
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");

-- CreateIndex
CREATE INDEX "tasks_sprintId_idx" ON "tasks"("sprintId");

-- CreateIndex
CREATE INDEX "tasks_boardId_idx" ON "tasks"("boardId");

-- CreateIndex
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_priority_idx" ON "tasks"("priority");

-- CreateIndex
CREATE INDEX "task_dependencies_taskId_idx" ON "task_dependencies"("taskId");

-- CreateIndex
CREATE INDEX "task_dependencies_dependsOnTaskId_idx" ON "task_dependencies"("dependsOnTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "task_dependencies_taskId_dependsOnTaskId_key" ON "task_dependencies"("taskId", "dependsOnTaskId");

-- CreateIndex
CREATE INDEX "sprints_projectId_idx" ON "sprints"("projectId");

-- CreateIndex
CREATE INDEX "sprints_status_idx" ON "sprints"("status");

-- CreateIndex
CREATE INDEX "kanban_boards_projectId_idx" ON "kanban_boards"("projectId");

-- CreateIndex
CREATE INDEX "kanban_columns_boardId_idx" ON "kanban_columns"("boardId");

-- CreateIndex
CREATE INDEX "task_comments_taskId_idx" ON "task_comments"("taskId");

-- CreateIndex
CREATE INDEX "task_comments_userId_idx" ON "task_comments"("userId");

-- CreateIndex
CREATE INDEX "task_attachments_taskId_idx" ON "task_attachments"("taskId");

-- CreateIndex
CREATE INDEX "time_entries_taskId_idx" ON "time_entries"("taskId");

-- CreateIndex
CREATE INDEX "time_entries_userId_idx" ON "time_entries"("userId");

-- CreateIndex
CREATE INDEX "time_entries_date_idx" ON "time_entries"("date");

-- CreateIndex
CREATE INDEX "project_tags_projectId_idx" ON "project_tags"("projectId");

-- CreateIndex
CREATE INDEX "task_tags_taskId_idx" ON "task_tags"("taskId");

-- CreateIndex
CREATE INDEX "job_logs_type_idx" ON "job_logs"("type");

-- CreateIndex
CREATE INDEX "job_logs_status_idx" ON "job_logs"("status");

-- CreateIndex
CREATE INDEX "job_logs_createdAt_idx" ON "job_logs"("createdAt");

-- CreateIndex
CREATE INDEX "job_logs_priority_idx" ON "job_logs"("priority");

-- CreateIndex
CREATE INDEX "financial_ledger_userId_idx" ON "financial_ledger"("userId");

-- CreateIndex
CREATE INDEX "financial_ledger_actorId_idx" ON "financial_ledger"("actorId");

-- CreateIndex
CREATE INDEX "financial_ledger_type_idx" ON "financial_ledger"("type");

-- CreateIndex
CREATE INDEX "financial_ledger_status_idx" ON "financial_ledger"("status");

-- CreateIndex
CREATE INDEX "financial_ledger_createdAt_idx" ON "financial_ledger"("createdAt");

-- CreateIndex
CREATE INDEX "user_wallets_userId_idx" ON "user_wallets"("userId");

-- CreateIndex
CREATE INDEX "user_wallets_currency_idx" ON "user_wallets"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_userId_currency_key" ON "user_wallets"("userId", "currency");

-- CreateIndex
CREATE INDEX "crypto_deposits_userId_idx" ON "crypto_deposits"("userId");

-- CreateIndex
CREATE INDEX "crypto_deposits_status_idx" ON "crypto_deposits"("status");

-- CreateIndex
CREATE INDEX "crypto_deposits_currency_idx" ON "crypto_deposits"("currency");

-- CreateIndex
CREATE INDEX "crypto_deposits_createdAt_idx" ON "crypto_deposits"("createdAt");

-- CreateIndex
CREATE INDEX "crypto_ledger_userId_idx" ON "crypto_ledger"("userId");

-- CreateIndex
CREATE INDEX "crypto_ledger_type_idx" ON "crypto_ledger"("type");

-- CreateIndex
CREATE INDEX "crypto_ledger_currency_idx" ON "crypto_ledger"("currency");

-- CreateIndex
CREATE INDEX "crypto_ledger_createdAt_idx" ON "crypto_ledger"("createdAt");

-- CreateIndex
CREATE INDEX "user_crypto_balances_userId_idx" ON "user_crypto_balances"("userId");

-- CreateIndex
CREATE INDEX "user_crypto_balances_currency_idx" ON "user_crypto_balances"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "user_crypto_balances_userId_currency_key" ON "user_crypto_balances"("userId", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "payment_plans_name_key" ON "payment_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_plans_stripePriceId_key" ON "payment_plans"("stripePriceId");

-- CreateIndex
CREATE INDEX "payment_plans_isActive_idx" ON "payment_plans"("isActive");

-- CreateIndex
CREATE INDEX "payment_methods_userId_idx" ON "payment_methods"("userId");

-- CreateIndex
CREATE INDEX "payment_methods_provider_idx" ON "payment_methods"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "payment_subscriptions_stripeSubscriptionId_key" ON "payment_subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "payment_subscriptions_userId_idx" ON "payment_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "payment_subscriptions_planId_idx" ON "payment_subscriptions"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_subscriptions_userId_status_key" ON "payment_subscriptions"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_providerTransactionId_key" ON "payment_transactions"("providerTransactionId");

-- CreateIndex
CREATE INDEX "payment_transactions_userId_idx" ON "payment_transactions"("userId");

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions"("status");

-- CreateIndex
CREATE INDEX "payment_transactions_provider_idx" ON "payment_transactions"("provider");

-- CreateIndex
CREATE INDEX "payment_transactions_createdAt_idx" ON "payment_transactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_price_data_currency_key" ON "crypto_price_data"("currency");

-- CreateIndex
CREATE INDEX "crypto_price_data_currency_idx" ON "crypto_price_data"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_eventId_key" ON "webhook_events"("eventId");

-- CreateIndex
CREATE INDEX "webhook_events_provider_idx" ON "webhook_events"("provider");

-- CreateIndex
CREATE INDEX "webhook_events_eventType_idx" ON "webhook_events"("eventType");

-- CreateIndex
CREATE INDEX "webhook_events_processed_idx" ON "webhook_events"("processed");

-- AddForeignKey
ALTER TABLE "RPAExecution" ADD CONSTRAINT "RPAExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "RPAWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RPAWorkflow" ADD CONSTRAINT "RPAWorkflow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_metrics" ADD CONSTRAINT "ai_usage_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copilot_feedback" ADD CONSTRAINT "copilot_feedback_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "copilot_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_withdrawals" ADD CONSTRAINT "crypto_withdrawals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medbeds_bookings" ADD CONSTRAINT "medbeds_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tasks" ADD CONSTRAINT "ai_tasks_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tasks" ADD CONSTRAINT "ai_tasks_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "ai_workflow_executions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workflow_executions" ADD CONSTRAINT "ai_workflow_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "pricing_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_media" ADD CONSTRAINT "blog_media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "blog_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_posts" ADD CONSTRAINT "social_media_posts_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "blog_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_posts" ADD CONSTRAINT "social_media_posts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "social_media_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "kanban_boards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_dependsOnTaskId_fkey" FOREIGN KEY ("dependsOnTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_boards" ADD CONSTRAINT "kanban_boards_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_columns" ADD CONSTRAINT "kanban_columns_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "kanban_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_tags" ADD CONSTRAINT "task_tags_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_ledger" ADD CONSTRAINT "financial_ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_ledger" ADD CONSTRAINT "financial_ledger_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_deposits" ADD CONSTRAINT "crypto_deposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_deposits" ADD CONSTRAINT "crypto_deposits_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_ledger" ADD CONSTRAINT "crypto_ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_ledger" ADD CONSTRAINT "crypto_ledger_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_crypto_balances" ADD CONSTRAINT "user_crypto_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_subscriptions" ADD CONSTRAINT "payment_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_subscriptions" ADD CONSTRAINT "payment_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "payment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "payment_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

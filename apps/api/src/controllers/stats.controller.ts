import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { keysService } from "../services/keys.service";

const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(50),
});

function buildDateFilter(from?: Date, to?: Date): Prisma.RequestLogWhereInput {
  if (!from && !to) return {};
  return {
    timestamp: {
      ...(from && { gte: from }),
      ...(to && { lte: to }),
    },
  };
}

// GET /stats
const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = dateRangeSchema.parse(req.query);
    const keyIds = await keysService.getOwnerKeyIds(req.clerkUserId!);

    const where: Prisma.RequestLogWhereInput = {
      apiKeyId: { in: keyIds },
      ...buildDateFilter(from, to),
    };

    const [totalKeys, totalRules, total, allowed, denied] = await Promise.all([
      prisma.apiKey.count({ where: { ownerId: req.clerkUserId! } }),
      prisma.rule.count({ where: { apiKeyId: { in: keyIds } } }),
      prisma.requestLog.count({ where }),
      prisma.requestLog.count({ where: { ...where, allowed: true } }),
      prisma.requestLog.count({ where: { ...where, allowed: false } }),
    ]);

    const topRules = await prisma.requestLog.groupBy({
      by: [Prisma.RequestLogScalarFieldEnum.ruleId],
      where,
      _count: { _all: true },
      orderBy: { _count: { ruleId: "desc" } },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        totalKeys,
        totalRules,
        total,
        allowed,
        denied,
        hitRate: total > 0 ? ((denied / total) * 100).toFixed(2) + "%" : "0%",
        topRules: topRules.map((r) => ({
          ruleId: r.ruleId,
          count: r._count && typeof r._count === "object" ? r._count._all ?? 0 : 0,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /stats/rules/:id
const getRuleStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ruleId = req.params.id;
    const { from, to } = dateRangeSchema.parse(req.query);
    const keyIds = await keysService.getOwnerKeyIds(req.clerkUserId!);

    const where: Prisma.RequestLogWhereInput = {
      apiKeyId: { in: keyIds },
      ruleId,
      ...buildDateFilter(from, to),
    };

    const [total, allowed, denied] = await Promise.all([
      prisma.requestLog.count({ where }),
      prisma.requestLog.count({ where: { ...where, allowed: true } }),
      prisma.requestLog.count({ where: { ...where, allowed: false } }),
    ]);

    const uniqueIdentifiers = await prisma.requestLog.groupBy({
      by: [Prisma.RequestLogScalarFieldEnum.userId],
      where,
    });

    res.json({
      success: true,
      data: {
        ruleId,
        total,
        allowed,
        denied,
        hitRate: total > 0 ? ((denied / total) * 100).toFixed(2) + "%" : "0%",
        uniqueIdentifiers: uniqueIdentifiers.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /stats/logs
const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = dateRangeSchema.parse(req.query);
    const { page, pageSize } = paginationSchema.parse(req.query);
    const keyIds = await keysService.getOwnerKeyIds(req.clerkUserId!);

    const where: Prisma.RequestLogWhereInput = {
      apiKeyId: { in: keyIds },
      ...buildDateFilter(from, to),
    };

    const [logs, total] = await Promise.all([
      prisma.requestLog.findMany({
        where,
        include: {
          rule: { select: { id: true, name: true } },
          apiKey: { select: { id: true, name: true } },
        },
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.requestLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      total,
      page,
      pageSize,
    });
  } catch (err) {
    next(err);
  }
};

export const statsController = {
  getOverview,
  getRuleStats,
  getLogs,
};

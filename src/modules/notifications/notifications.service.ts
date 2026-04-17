import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { AppErrors, AppException } from '../../common/exceptions/exception';
import { successResponse } from '../../common/response';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { NotificationsGateway } from './notifications.gateway';

type CreateNotificationInput = {
    type: string;
    title: string;
    message: string;
    relatedUrl?: string | null;
    metadataJson?: Record<string, unknown> | null;
};
@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly notificationsGateway: NotificationsGateway
    ) { }

    async createNotification(userId: string, input: CreateNotificationInput) {
        try {
            const notification = this.notificationRepository.create({
                user: { id: userId } as any,
                type: input.type,
                title: input.title,
                message: input.message,
                relatedUrl: input.relatedUrl ?? null,
                metadataJson: input.metadataJson ?? null,
                isRead: false,
            });
            return await this.notificationRepository.save(notification);
        } catch (error) {
            if (error instanceof AppException) {
                throw error;
            }
            throw AppErrors.notification.notificationCreationFailed()
        }
    }

    async createAndPush(userId: string, input: CreateNotificationInput) {
        const saved = await this.createNotification(userId, input);

        const reloaded = await this.notificationRepository.findOne({
            where: { id: saved.id },
            relations: { user: true },
        });
        if (!reloaded) throw AppErrors.notification.notificationCreationFailed();

        const payload = this.serializeNotification(reloaded);
        this.notificationsGateway.pushToUser(userId, payload);

        const unreadCount = await this.getUnreadCountValue(userId);
        this.notificationsGateway.pushUnreadCount(userId, unreadCount);

        return reloaded
    }

    async getMyNotifications(currentUser: AuthenticatedUser, query: ListNotificationsDto) {
        try {
            const page = query.page ?? 1;
            const limit = query.limit ?? 20;

            const qb = this.notificationRepository
                .createQueryBuilder('notification')
                .leftJoinAndSelect('notification.user', 'user')
                .where('user.id = :userId', { userId: currentUser.id });

            if (query.isRead !== undefined) {
                qb.andWhere('notification.is_read = :isRead', {
                    isRead: query.isRead,
                })
            }
            if (query.type) {
                qb.andWhere('notification.type = :type', {
                    type: query.type,
                });
            }

            qb.orderBy('notification.created_at', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);

            const [items, total] = await qb.getManyAndCount();

            return successResponse({
                message: 'Lay danh sach thong bao thanh cong',
                data: {
                    items: items.map((item) => this.serializeNotification(item)),
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPage: Math.ceil(total / limit),
                    }
                }
            })
        } catch {
            throw AppErrors.notification.notificationLoadFailed();
        }
    }

    async getUnreadCount(currentUser: AuthenticatedUser) {
        const unreadCount = await this.getUnreadCountValue(currentUser.id)

        return successResponse({
            message: 'Lay so thong bao chua doc thanh cong',
            data: { unreadCount, }
        })
    }

    async markAsRead(notificationId: string, currentUser: AuthenticatedUser) {
        const notification = await this.notificationRepository.findOne({
            where: {
                id: notificationId,
                user: { id: currentUser.id },
            },
            relations: {
                user: true
            }
        });
        if (!notification) throw AppErrors.notification.notificationNotFound();

        if (notification.isRead) {
            return successResponse({
                message: 'Thong bao da duoc danh dau da doc truoc do',
                data: this.serializeNotification(notification)
            })
        }
        try {
            notification.isRead = true;
            const saved = await this.notificationRepository.save(notification)

            const payload = this.serializeNotification(saved);
            this.notificationsGateway.pushUpdateNotification(currentUser.id, payload);

            const unreadCount = await this.getUnreadCountValue(currentUser.id);
            this.notificationsGateway.pushUnreadCount(currentUser.id, unreadCount);
            return successResponse({
                message: 'Danh dau thong bao da doc thanh cong',
                data: payload,
            });
        } catch {
            throw AppErrors.notification.notificationReadFailed();
        }
    }

    async markAllAsRead(currentUser: AuthenticatedUser) {
        try {
            await this.notificationRepository
                .createQueryBuilder()
                .update(Notification)
                .set({ isRead: true })
                .where('user_id = :userId', { userId: currentUser.id })
                .andWhere('is_read = :isRead', { isRead: false })
                .execute();

            const unreadCount = await this.getUnreadCountValue(currentUser.id);
            this.notificationsGateway.pushUnreadCount(currentUser.id, unreadCount);

            return successResponse({
                message: 'Danh dau tat ca thong bao da doc thanh cong',
                data: {
                    unreadCount,
                },
            });
        } catch {
            throw AppErrors.notification.notificationReadFailed();
        }
    }

    async deleteNotification(
        notificationId: string,
        currentUser: AuthenticatedUser,
    ) {
        const notification = await this.notificationRepository.findOne({
            where: {
                id: notificationId,
                user: { id: currentUser.id },
            },
            relations: {
                user: true,
            },
        });

        if (!notification) {
            throw AppErrors.notification.notificationNotFound();
        }

        try {
            await this.notificationRepository.remove(notification);

            this.notificationsGateway.pushDeletedNotification(
                currentUser.id,
                notification.id,
            );

            const unreadCount = await this.getUnreadCountValue(currentUser.id);
            this.notificationsGateway.pushUnreadCount(currentUser.id, unreadCount);

            return successResponse({
                message: 'Xoa thong bao thanh cong',
                data: {
                    id: notification.id,
                },
            });
        } catch {
            throw AppErrors.notification.notificationDeleteFailed();
        }
    }

    private async getUnreadCountValue(userId: string) {
        return this.notificationRepository.count({
            where: {
                user: { id: userId },
                isRead: false,
            },
        });
    }

    private serializeNotification(notification: Notification) {
        return {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            relatedUrl: notification.relatedUrl,
            metadataJson: notification.metadataJson,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        };
    }
}
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { toast } from 'sonner'
import { getUserActivities } from '@/services/user'
import { UserActivity, UserActivityLogsType } from '@/models/activity'
import { Activity } from 'lucide-react'

export default function UserActivitiesPage() {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const data = await getUserActivities()
        setActivities(data)
      } catch (error) {
        toast.error('Không thể tải lịch sử hoạt động')
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionLabel = (action: string) => {
    const actionMap: { [key in UserActivityLogsType]: string } & { [key: string]: string } = {
      [UserActivityLogsType.Login]: 'Đăng nhập',
      [UserActivityLogsType.ForgotPassword]: 'Quên mật khẩu',
      [UserActivityLogsType.ResetPassword]: 'Đặt lại mật khẩu',
      [UserActivityLogsType.UpdateProfile]: 'Cập nhật thông tin cá nhân',
      [UserActivityLogsType.UpdatePassword]: 'Đổi mật khẩu',
      [UserActivityLogsType.UpdateEmail]: 'Đổi email',
      [UserActivityLogsType.UpdatePhone]: 'Đổi số điện thoại',
      // Additional actions not in enum
      'logout': 'Đăng xuất',
      'register': 'Đăng ký',
      'add_identity_document': 'Thêm CCCD/Hộ chiếu',
    }
    return actionMap[action] || action
  }



  if (loading) {
    return (
      <div className=''>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>Lịch sử hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className=''>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Lịch sử hoạt động</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className='text-center py-8'>
              <Activity className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <p className='text-gray-500'>Chưa có hoạt động nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hoạt động</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <span className='font-medium'>
                        {getActionLabel(activity.action)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm text-gray-600'>
                        {formatDate(activity.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <div className='font-medium'>
                          {activity.location || `${activity.city}, ${activity.country}`}
                        </div>
                        {activity.latitude && activity.longitude && (
                          <div className='text-xs text-gray-500'>
                            {activity.latitude}, {activity.longitude}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm max-w-xs'>
                        <div className='truncate' title={activity.user_agent_formatted || activity.user_agent}>
                          {activity.user_agent_formatted || activity.user_agent}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm text-gray-600 font-mono'>
                        {activity.ip_address}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
import { useState } from 'react'
import { Pencil, Plus, UserMinus } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Button, ConfirmDialog, DataTable, PageHeader, Pagination, SearchInput, Select, StatusBadge } from '../../components/ui'
import { PERMISSIONS, ROLE_LABELS, STAFF_ROLES } from '../../constants/roles'
import { useListParams } from '../../hooks/useListParams'
import { usePermission } from '../../hooks/usePermission'
import { selectCurrentUser } from '../../store/selectors/authSelectors'
import { formatRelative, initials } from '../../utils/format'
import { useDeactivateUser, useUsers } from './useUsers'
import UserFormModal from './UserFormModal'

const ROLE_FILTERS = STAFF_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))

function StaffPage() {
  const can = usePermission()
  const currentUser = useSelector(selectCurrentUser)
  const canManage = can(PERMISSIONS.USERS_MANAGE)
  const { params, setParams } = useListParams({ sortBy: 'name', sortOrder: 'asc' })
  const { data, isLoading, error, refetch } = useUsers(params)
  const deactivate = useDeactivateUser()
  const [editing, setEditing] = useState(null)
  const [toDeactivate, setToDeactivate] = useState(null)

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (user) => (
        <div className="d-flex align-items-center gap-2">
          <span className="avatar">{initials(user.name)}</span>
          <div className="min-w-0">
            <div className="cell-primary">{user.name}</div>
            <div className="cell-secondary">{user.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (u) => <StatusBadge status={u.role} label={ROLE_LABELS[u.role]} dot={false} /> },
    { key: 'department', header: 'Department', render: (u) => u.department?.code ?? <span className="text-soft">—</span> },
    { key: 'lastLoginAt', header: 'Last sign-in', sortable: true, render: (u) => <span className="text-muted-cp">{u.lastLoginAt ? formatRelative(u.lastLoginAt) : 'Never'}</span> },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
  ]
  if (canManage) {
    columns.push({
      key: 'actions',
      header: '',
      className: 'text-end',
      render: (user) =>
        user.id === currentUser.id ? (
          <span className="small text-soft">You</span>
        ) : (
          <div className="d-inline-flex gap-1">
            <Button variant="ghost" size="sm" iconOnly icon={Pencil} onClick={() => setEditing(user)} aria-label={`Edit ${user.name}`} />
            {user.status === 'ACTIVE' && (
              <Button variant="ghost" size="sm" iconOnly icon={UserMinus} onClick={() => setToDeactivate(user)} aria-label={`Deactivate ${user.name}`} />
            )}
          </div>
        ),
    })
  }

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle="Administrators, principals and examiners."
        actions={canManage && <Button icon={Plus} onClick={() => setEditing({})}>Add staff</Button>}
      />
      <div className="surface">
        <div className="table-toolbar">
          <SearchInput className="search" value={params.search ?? ''} onSearch={(search) => setParams({ search })} placeholder="Search name or email" />
          <Select placeholder="All roles" options={ROLE_FILTERS} value={params.role ?? ''} onChange={(e) => setParams({ role: e.target.value })} />
          <Select
            placeholder="Any status"
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
            value={params.status ?? ''}
            onChange={(e) => setParams({ status: e.target.value })}
          />
        </div>
        <DataTable
          columns={columns}
          rows={data?.items}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          sort={{ sortBy: params.sortBy, sortOrder: params.sortOrder }}
          onSortChange={(sortBy, sortOrder) => setParams({ sortBy, sortOrder })}
        />
        <Pagination pagination={data?.pagination} onPageChange={(page) => setParams({ page })} />
      </div>

      <UserFormModal open={editing !== null} user={editing?.id ? editing : null} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={Boolean(toDeactivate)}
        title="Deactivate account?"
        message={`${toDeactivate?.name} will be signed out everywhere and will no longer be able to sign in.`}
        confirmLabel="Deactivate"
        loading={deactivate.isPending}
        onCancel={() => setToDeactivate(null)}
        onConfirm={() => deactivate.mutate(toDeactivate.id, { onSuccess: () => setToDeactivate(null) })}
      />
    </>
  )
}

export default StaffPage

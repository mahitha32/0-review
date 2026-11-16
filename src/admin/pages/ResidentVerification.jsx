// src/pages/ResidentVerification.jsx — Village Resident Verification & Panchayat Code Management
import { useEffect, useState, useCallback } from 'react'
import { residentVerificationApi } from '../api/api'
import toast from 'react-hot-toast'
import {
  MdVerifiedUser, MdCheckCircle, MdCancel, MdSearch, MdRefresh,
  MdVpnKey, MdPerson, MdHome, MdDescription, MdImage, MdClose, MdAdd
} from 'react-icons/md'
import { format } from 'date-fns'

export default function ResidentVerification() {
  const [activeTab, setActiveTab] = useState('requests') // 'requests' | 'codes'
  const [statusFilter, setStatusFilter] = useState('pending') // 'pending' | 'approved' | 'rejected' | 'all'
  const [search, setSearch] = useState('')
  const [wardFilter, setWardFilter] = useState('')
  const [page, setPage] = useState(1)

  const [requests, setRequests] = useState([])
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Code generation state
  const [codes, setCodes] = useState([])
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [genWard, setGenWard] = useState('1')
  const [genCount, setGenCount] = useState('5')
  const [genCustomCode, setGenCustomCode] = useState('')
  const [generating, setGenerating] = useState(false)

  // Review modal
  const [actionModal, setActionModal] = useState(null) // { type: 'approve' | 'reject', request: {...} }
  const [actionRemarks, setActionRemarks] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Image modal
  const [imageModal, setImageModal] = useState(null)

  const fetchStats = useCallback(() => {
    residentVerificationApi.getStats()
      .then(res => setStats(res.data.data))
      .catch(() => {})
  }, [])

  const fetchRequests = useCallback(() => {
    setLoading(true)
    residentVerificationApi.getRequests({
      status: statusFilter,
      ward_id: wardFilter || undefined,
      search: search || undefined,
      page,
      per_page: 15
    })
      .then(res => {
        setRequests(res.data.data.requests)
        setPagination(res.data.data.pagination)
      })
      .catch(() => toast.error('Failed to load resident verification requests'))
      .finally(() => setLoading(false))
  }, [statusFilter, wardFilter, search, page])

  const fetchCodes = useCallback(() => {
    setLoadingCodes(true)
    residentVerificationApi.getCodes({ ward_id: wardFilter || undefined })
      .then(res => setCodes(res.data.data.codes))
      .catch(() => toast.error('Failed to load verification codes'))
      .finally(() => setLoadingCodes(false))
  }, [wardFilter])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests()
    } else {
      fetchCodes()
    }
  }, [activeTab, fetchRequests, fetchCodes])

  const handleApprove = async () => {
    if (!actionModal) return
    setActionLoading(true)
    try {
      await residentVerificationApi.approveRequest(
        actionModal.request.request_id,
        actionRemarks.trim() || 'Verified by Panchayat Officer'
      )
      toast.success('Resident verification approved!')
      setActionModal(null)
      setActionRemarks('')
      fetchRequests()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!actionModal) return
    if (!actionRemarks.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    setActionLoading(true)
    try {
      await residentVerificationApi.rejectRequest(
        actionModal.request.request_id,
        actionRemarks.trim()
      )
      toast.success('Resident verification request rejected')
      setActionModal(null)
      setActionRemarks('')
      fetchRequests()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleGenerateCodes = async (e) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const res = await residentVerificationApi.generateCodes({
        ward_id: genWard,
        count: parseInt(genCount, 10),
        custom_code: genCustomCode.trim() || undefined
      })
      toast.success(res.data?.message || 'Verification codes generated!')
      setGenCustomCode('')
      fetchCodes()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h2>Village Resident Verification & Genuine Complaint Validation</h2>
          <p>Verify Vemavaram residency, review local proofs, and issue Panchayat verification codes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-label">Pending Reviews</div>
          <div className="stat-value" style={{ color: '#d97706' }}>
            {stats?.pending_requests ?? '—'}
          </div>
          <div className="stat-sub">Citizens awaiting residency confirmation</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-label">Verified Residents</div>
          <div className="stat-value" style={{ color: '#059669' }}>
            {stats?.verified_citizens ?? '—'}
          </div>
          <div className="stat-sub">Confirmed Vemavaram households</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-label">Available Codes</div>
          <div className="stat-value" style={{ color: '#2563eb' }}>
            {stats?.available_codes ?? '—'}
          </div>
          <div className="stat-sub">Active Panchayat verification codes</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-label">Duplicate Suspects Flagged</div>
          <div className="stat-value" style={{ color: '#dc2626' }}>
            {stats?.duplicate_suspects ?? '—'}
          </div>
          <div className="stat-sub">Cross-checked 14-day complaints</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '4px 16px 0' }}>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '12px 20px',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'requests' ? '3px solid #059669' : '3px solid transparent',
              color: activeTab === 'requests' ? '#059669' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <MdVerifiedUser size={18} />
            <span>Residency Verification Requests</span>
            {stats?.pending_requests > 0 && (
              <span style={{
                background: '#fef3c7',
                color: '#b45309',
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
                fontWeight: 700
              }}>
                {stats.pending_requests} pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            style={{
              padding: '12px 20px',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'codes' ? '3px solid #059669' : '3px solid transparent',
              color: activeTab === 'codes' ? '#059669' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <MdVpnKey size={18} />
            <span>Panchayat Verification Codes</span>
          </button>
        </div>

        {/* Tab 1: Requests */}
        {activeTab === 'requests' && (
          <div style={{ padding: 20 }}>
            {/* Filters */}
            <div className="filters-bar" style={{ marginBottom: 16 }}>
              <div className="search-wrapper">
                <MdSearch className="search-icon" />
                <input
                  className="search-input"
                  placeholder="Search by citizen name, mobile, or address…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                />
              </div>

              <select
                className="form-control"
                style={{ width: 160 }}
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              >
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Statuses</option>
              </select>

              <select
                className="form-control"
                style={{ width: 140 }}
                value={wardFilter}
                onChange={e => { setWardFilter(e.target.value); setPage(1) }}
              >
                <option value="">All Wards</option>
                <option value="1">Ward 1</option>
                <option value="2">Ward 2</option>
                <option value="3">Ward 3</option>
                <option value="4">Ward 4</option>
                <option value="5">Ward 5</option>
              </select>

              <button className="btn btn-outline btn-sm" onClick={fetchRequests}>
                <MdRefresh /> Refresh
              </button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : requests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <h3>No verification requests found</h3>
                <p>No citizen requests match the selected filters.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Req ID</th>
                      <th>Citizen</th>
                      <th>Ward</th>
                      <th>Vemavaram Address</th>
                      <th>Proof Reference</th>
                      <th>Submitted Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r.request_id}>
                        <td><code>REQ-{r.request_id}</code></td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.user_name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>📱 {r.user_mobile}</div>
                        </td>
                        <td>
                          <span style={{
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {r.ward_name || `Ward ${r.ward_id}`}
                          </span>
                        </td>
                        <td style={{ maxWidth: 220, fontSize: 12, color: '#334155' }}>
                          {r.address}
                        </td>
                        <td>
                          <div style={{ fontSize: 12, fontWeight: 500 }}>
                            {r.proof_type || 'Self Declaration'}
                          </div>
                          {r.proof_masked_id && (
                            <div style={{ fontSize: 11, color: '#64748b' }}>Ref: {r.proof_masked_id}</div>
                          )}
                          {r.proof_url && (
                            <button
                              onClick={() => setImageModal(r.proof_url)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                color: '#2563eb',
                                fontSize: 11,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                marginTop: 2
                              }}
                            >
                              <MdImage /> View Proof
                            </button>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>
                          {r.created_at ? format(new Date(r.created_at), 'dd MMM yyyy') : '—'}
                        </td>
                        <td>
                          {r.status === 'pending' && (
                            <span style={{
                              background: '#fef3c7',
                              color: '#b45309',
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600
                            }}>
                              Pending Review
                            </span>
                          )}
                          {r.status === 'approved' && (
                            <span style={{
                              background: '#d1fae5',
                              color: '#047857',
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600
                            }}>
                              ✓ Approved
                            </span>
                          )}
                          {r.status === 'rejected' && (
                            <span style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600
                            }}>
                              ✕ Rejected
                            </span>
                          )}
                          {r.review_remarks && (
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, maxWidth: 120 }}>
                              {r.review_remarks}
                            </div>
                          )}
                        </td>
                        <td>
                          {r.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                className="btn btn-sm"
                                style={{ background: '#059669', color: '#fff', padding: '4px 8px', fontSize: 12 }}
                                onClick={() => {
                                  setActionModal({ type: 'approve', request: r })
                                  setActionRemarks('Verified with Ward Panchayat records')
                                }}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '4px 8px', fontSize: 12 }}
                                onClick={() => {
                                  setActionModal({ type: 'reject', request: r })
                                  setActionRemarks('')
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
                <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  ← Prev
                </button>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  Page {page} of {pagination.pages}
                </span>
                <button className="btn btn-outline btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Codes */}
        {activeTab === 'codes' && (
          <div style={{ padding: 20 }}>
            {/* Generate Code Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 16,
              marginBottom: 20
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                Generate Village Verification Codes for Genuine Residents
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: 12, color: '#64748b' }}>
                Issue these codes directly to verified households or ward members for instant account verification.
              </p>

              <form onSubmit={handleGenerateCodes} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Ward</label>
                  <select
                    className="form-control"
                    style={{ width: 130 }}
                    value={genWard}
                    onChange={e => setGenWard(e.target.value)}
                  >
                    <option value="1">Ward 1</option>
                    <option value="2">Ward 2</option>
                    <option value="3">Ward 3</option>
                    <option value="4">Ward 4</option>
                    <option value="5">Ward 5</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Batch Size</label>
                  <select
                    className="form-control"
                    style={{ width: 110 }}
                    value={genCount}
                    onChange={e => setGenCount(e.target.value)}
                  >
                    <option value="1">1 code</option>
                    <option value="5">5 codes</option>
                    <option value="10">10 codes</option>
                    <option value="20">20 codes</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Custom Code (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. VEM-W1-PANCHAYAT"
                    style={{ width: 220 }}
                    value={genCustomCode}
                    onChange={e => setGenCustomCode(e.target.value.toUpperCase())}
                  />
                </div>

                <button
                  type="submit"
                  disabled={generating}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#059669', borderColor: '#059669' }}
                >
                  <MdAdd />
                  <span>{generating ? 'Generating…' : 'Generate Codes'}</span>
                </button>
              </form>
            </div>

            {/* List Codes */}
            {loadingCodes ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : codes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔑</div>
                <h3>No verification codes generated yet</h3>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Verification Code</th>
                      <th>Ward</th>
                      <th>Status</th>
                      <th>Redeemed By</th>
                      <th>Generated By</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map(c => (
                      <tr key={c.code_id}>
                        <td>
                          <code style={{
                            background: '#f1f5f9',
                            color: '#0f172a',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 4,
                            letterSpacing: 0.5
                          }}>
                            {c.code}
                          </code>
                        </td>
                        <td>{c.ward_name || `Ward ${c.ward_id}`}</td>
                        <td>
                          {c.is_used ? (
                            <span style={{
                              background: '#e2e8f0',
                              color: '#64748b',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600
                            }}>
                              Used
                            </span>
                          ) : (
                            <span style={{
                              background: '#d1fae5',
                              color: '#047857',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600
                            }}>
                              ✓ Available
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {c.used_by_name ? (
                            <div>
                              <div style={{ fontWeight: 600 }}>{c.used_by_name}</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>{c.used_by_mobile}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{c.created_by_name || 'Admin'}</td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>
                          {c.created_at ? format(new Date(c.created_at), 'dd MMM yyyy') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approve / Reject Modal */}
      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3>
                {actionModal.type === 'approve' ? 'Approve Resident Verification' : 'Reject Verification Request'}
              </h3>
              <button className="modal-close" onClick={() => setActionModal(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, marginBottom: 14, fontSize: 13 }}>
                <div><strong>Citizen:</strong> {actionModal.request.user_name} ({actionModal.request.user_mobile})</div>
                <div><strong>Ward:</strong> {actionModal.request.ward_name || `Ward ${actionModal.request.ward_id}`}</div>
                <div><strong>Address:</strong> {actionModal.request.address}</div>
                {actionModal.request.proof_type && (
                  <div><strong>Proof Type:</strong> {actionModal.request.proof_type} {actionModal.request.proof_masked_id && `(${actionModal.request.proof_masked_id})`}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  {actionModal.type === 'approve' ? 'Officer Verification Remarks (Optional)' : 'Reason for Rejection *'}
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder={
                    actionModal.type === 'approve'
                      ? 'e.g. Verified with Ward register'
                      : 'e.g. House address could not be matched in Ward 2 register. Please resubmit with street landmark.'
                  }
                  value={actionRemarks}
                  onChange={e => setActionRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setActionModal(null)}>Cancel</button>
                {actionModal.type === 'approve' ? (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ background: '#059669', borderColor: '#059669' }}
                    disabled={actionLoading}
                    onClick={handleApprove}
                  >
                    {actionLoading ? 'Approving…' : 'Confirm Approval'}
                  </button>
                ) : (
                  <button
                    className="btn btn-sm"
                    style={{ background: '#dc2626', color: '#fff' }}
                    disabled={actionLoading}
                    onClick={handleReject}
                  >
                    {actionLoading ? 'Rejecting…' : 'Confirm Rejection'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imageModal && (
        <div className="modal-overlay" onClick={() => setImageModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Resident Proof Document</h3>
              <button className="modal-close" onClick={() => setImageModal(null)}><MdClose /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: 16 }}>
              <img src={imageModal} alt="Proof Document" style={{ maxWidth: '100%', maxHeight: 450, borderRadius: 8 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

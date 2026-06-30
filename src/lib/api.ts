import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        if (config.url?.startsWith('/api/admin/') || config.url?.startsWith('/api/auth/csrf-token')) {
          const csrf = localStorage.getItem('csrf_token');
          if (csrf) {
            config.headers['X-CSRF-Token'] = csrf;
          }
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config?._retry) {
          error.config._retry = true;
          try {
            await this.client.post('/api/auth/refresh');
            return this.client(error.config);
          } catch {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('user');
              localStorage.removeItem('csrf_token');
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async getCsrfToken() {
    const { data } = await this.client.get('/api/auth/csrf-token');
    return data;
  }

  async register(data: {
    username: string; email: string; password: string;
    full_name: string;
    gender?: string; country?: string; college?: string;
    age_group?: string; player_type?: string; agreed_tos: boolean;
  }) {
    const { data: res } = await this.client.post('/api/auth/register', data);
    return res;
  }

  async login(username: string, password: string) {
    const { data } = await this.client.post('/api/auth/login', { username, password });
    return data;
  }

  async adminLogin(password: string, accessKey?: string) {
    const { data } = await this.client.post('/api/auth/admin/login', { password, access_key: accessKey || '' });
    return data;
  }

  async logout() {
    await this.client.post('/api/auth/logout').catch(() => {});
  }

  async getMe() {
    const { data } = await this.client.get('/api/auth/me');
    return data;
  }

  async getChallenges(category?: string) {
    const params = category ? `?category=${category}` : '';
    const { data } = await this.client.get(`/api/challenges${params}`);
    return data;
  }

  async getScoreboard(limit = 50, offset = 0) {
    const { data } = await this.client.get(`/api/scoreboard?limit=${limit}&offset=${offset}`);
    return data;
  }

  async getTeamScoreboard(limit = 50, offset = 0) {
    const { data } = await this.client.get(`/api/scoreboard/teams?limit=${limit}&offset=${offset}`);
    return data;
  }

  async getAdminDashboard() {
    const { data } = await this.client.get('/api/admin/dashboard');
    return data;
  }

  async getAdminUsers() {
    const { data } = await this.client.get('/api/admin/users');
    return data;
  }

  async banUser(userId: number) {
    const { data } = await this.client.post('/api/admin/users/ban', { user_id: userId, reason: 'Admin action' });
    return data;
  }

  async unbanUser(userId: number) {
    const { data } = await this.client.post('/api/admin/users/unban', { user_id: userId, reason: 'Admin action' });
    return data;
  }

  async deleteUser(userId: number) {
    const { data } = await this.client.delete(`/api/admin/users/${userId}`);
    return data;
  }

  async adminChangeUserPassword(userId: number, newPassword: string) {
    const { data } = await this.client.post('/api/admin/users/change-password', { user_id: userId, new_password: newPassword });
    return data;
  }

  async resetUserScore(userId: number) {
    const { data } = await this.client.post(`/api/admin/users/${userId}/reset-score`);
    return data;
  }

  async getAdminLogs(severity?: string) {
    const params = severity ? `?severity=${severity}` : '';
    const { data } = await this.client.get(`/api/admin/logs${params}`);
    return data;
  }

  async createAnnouncement(title: string, message: string) {
    const { data } = await this.client.post(`/api/admin/announcements?title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}`);
    return data;
  }

  async getAdminAnnouncements() {
    const { data } = await this.client.get('/api/admin/announcements');
    return data;
  }

  async adminUpdateAnnouncement(id: number, title: string, message: string) {
    const { data } = await this.client.put(`/api/admin/announcements/${id}?title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}`);
    return data;
  }

  async adminDeleteAnnouncement(id: number) {
    const { data } = await this.client.delete(`/api/admin/announcements/${id}`);
    return data;
  }

  async resetCompetition() {
    const { data } = await this.client.post('/api/admin/reset');
    return data;
  }

  async changeAdminCredentials(currentUsername: string, currentPassword: string, newUsername?: string, newPassword?: string) {
    const { data } = await this.client.post('/api/admin/credentials', {
      current_username: currentUsername,
      current_password: currentPassword,
      new_username: newUsername || null,
      new_password: newPassword || null,
    });
    return data;
  }

  async getAdminChallenges() {
    const { data } = await this.client.get('/api/admin/challenges');
    return data;
  }

  async adminCreateChallenge(challenge: any) {
    const { data } = await this.client.post('/api/admin/challenges', challenge);
    return data;
  }

  async adminDeleteChallenge(id: number) {
    const { data } = await this.client.delete(`/api/admin/challenges/${id}`);
    return data;
  }

  async adminTogglePublishChallenge(id: number) {
    const { data } = await this.client.post(`/api/admin/challenges/${id}/toggle-publish`);
    return data;
  }

  async adminUpdateChallenge(id: number, challenge: any) {
    const { data } = await this.client.put(`/api/admin/challenges/${id}`, challenge);
    return data;
  }

  async adminUploadChallengeAsset(challengeId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.client.post(`/api/admin/challenges/${challengeId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return data;
  }

  async adminDeleteChallengeAssets(challengeId: number) {
    const { data } = await this.client.delete(`/api/admin/challenges/${challengeId}/assets`);
    return data;
  }

  async getChallenge(id: number) {
    const { data } = await this.client.get(`/api/challenges/${id}`);
    return data;
  }

  async getMySubmissions(limit = 50) {
    const { data } = await this.client.get(`/api/submissions?limit=${limit}`);
    return data;
  }

  async getAdminSubmissions() {
    const { data } = await this.client.get('/api/admin/submissions');
    return data;
  }

  async clearSubmissions() {
    const { data } = await this.client.delete('/api/admin/submissions');
    return data;
  }

  async getAnnouncements() {
    const { data } = await this.client.get('/api/announcements');
    return data;
  }

  async submitFlag(challengeId: number, flag: string) {
    const { data } = await this.client.post('/api/submissions', { challenge_id: challengeId, flag });
    return data;
  }

  async adminChangeUsername(userId: number, newUsername: string) {
    const { data } = await this.client.post('/api/admin/users/change-username', { user_id: userId, new_username: newUsername });
    return data;
  }

  async adminResetUserSolves(userId: number) {
    const { data } = await this.client.post(`/api/admin/users/${userId}/reset-solves`);
    return data;
  }

  async adminResetChallengeSolves(challengeId: number) {
    const { data } = await this.client.post(`/api/admin/challenges/${challengeId}/reset-solves`);
    return data;
  }

  async adminResetUserBlood(userId: number) {
    const { data } = await this.client.post(`/api/admin/users/${userId}/reset-blood`);
    return data;
  }

  async resetAllBlood() {
    const { data } = await this.client.post('/api/admin/reset-blood');
    return data;
  }

  async getSecurityStats() {
    const { data } = await this.client.get('/api/admin/security/stats');
    return data;
  }

  async getSecurityLogs(params?: { severity?: string; attack_type?: string; ip?: string; limit?: number; offset?: number }) {
    const search = new URLSearchParams();
    if (params?.severity) search.set('severity', params.severity);
    if (params?.attack_type) search.set('attack_type', params.attack_type);
    if (params?.ip) search.set('ip', params.ip);
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.offset) search.set('offset', String(params.offset));
    const query = search.toString();
    const { data } = await this.client.get(`/api/admin/security/logs${query ? `?${query}` : ''}`);
    return data;
  }

  async blockIp(ip: string, reason?: string) {
    const { data } = await this.client.post('/api/admin/security/block', { ip_address: ip, reason: reason || '' });
    return data;
  }

  async unblockIp(ip: string) {
    const { data } = await this.client.post('/api/admin/security/unblock', { ip_address: ip });
    return data;
  }

  async whitelistIp(ip: string) {
    const { data } = await this.client.post('/api/admin/security/whitelist', { ip_address: ip });
    return data;
  }

  async reviewAttackLog(logId: number) {
    const { data } = await this.client.post(`/api/admin/security/review/${logId}`);
    return data;
  }

  async getSecuritySettings() {
    const { data } = await this.client.get('/api/admin/security/settings');
    return data;
  }

  async bulkUnblockIps(ips: string[]) {
    const { data } = await this.client.post('/api/admin/security/bulk-unblock', ips);
    return data;
  }

  async clearLogs() {
    const { data } = await this.client.delete('/api/admin/logs');
    return data;
  }

  async clearSecurityLogs() {
    const { data } = await this.client.delete('/api/admin/security/logs');
    return data;
  }

  async checkAttackLogIntegrity() {
    const { data } = await this.client.get('/api/admin/security/integrity-check');
    return data;
  }

  async getRealFlags() {
    const { data } = await this.client.get('/api/admin/real-flags');
    return data;
  }

  async createRealFlag(challengeName: string, flag: string, category?: string, notes?: string) {
    const { data } = await this.client.post('/api/admin/real-flags', {
      challenge_name: challengeName, flag, category: category || null, notes: notes || null,
    });
    return data;
  }

  async updateRealFlag(id: number, updates: { challenge_name?: string; flag?: string; category?: string; notes?: string }) {
    const { data } = await this.client.put(`/api/admin/real-flags/${id}`, updates);
    return data;
  }

  async deleteRealFlag(id: number) {
    const { data } = await this.client.delete(`/api/admin/real-flags/${id}`);
    return data;
  }

  async getSecurityFeatures() {
    const { data } = await this.client.get('/api/admin/security/features');
    return data;
  }

  async toggleSecurityFeature(feature: string) {
    const { data } = await this.client.post(`/api/admin/security/features/toggle?feature=${feature}`);
    return data;
  }

  async updateProfile(data: { username?: string; email?: string; college?: string; country?: string }) {
    const { data: res } = await this.client.put('/api/auth/profile', data);
    return res;
  }

  async changeOwnPassword(data: { current_password: string; new_password: string }) {
    const { data: res } = await this.client.post('/api/auth/change-password', data);
    return res;
  }

  async auditTrack(teamId: number, challengeId: number) {
    const { data } = await this.client.post('/api/admin/audit/track', { team_id: teamId, challenge_id: challengeId });
    return data;
  }

  async auditScan() {
    const { data } = await this.client.get('/api/admin/audit/scan');
    return data;
  }

  async collusionScan() {
    const { data } = await this.client.get('/api/admin/collusion/scan');
    return data;
  }

  async qaRun() {
    const { data } = await this.client.get('/api/admin/qa/run');
    return data;
  }

  async qaChmod() {
    const { data } = await this.client.post('/api/admin/qa/chmod');
    return data;
  }

  async invalidateAllSessions() {
    const { data } = await this.client.post('/api/auth/invalidate-all');
    return data;
  }

  async adminPublishAllWeb() {
    const { data } = await this.client.post('/api/admin/challenges/publish-all-web');
    return data;
  }

  async adminBulkToggleChallenges(action: 'publish' | 'unpublish', category?: string, difficulty?: string) {
    const { data } = await this.client.post('/api/admin/challenges/bulk-toggle', { action, category, difficulty });
    return data;
  }
}

export const api = new ApiClient();

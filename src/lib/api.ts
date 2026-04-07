import {
  ApplicationStatus,
  Conversation,
  Document,
  Message,
  Notification,
  ScholarshipApplication,
  User,
  UserRole,
} from '@/types';

const API_PREFIX = '/api/v1';

function normalizeApiUrl(url?: string) {
  const baseUrl = (url ?? 'https://dakar-scholarship-hub-backen.onrender.com').replace(/\/+$/, '');
  return baseUrl.endsWith(API_PREFIX) ? baseUrl : `${baseUrl}${API_PREFIX}`;
}

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL as string | undefined);
const ACCESS_TOKEN_KEY = 'dakar_scholarship_access_token';
const REFRESH_TOKEN_KEY = 'dakar_scholarship_refresh_token';
const USER_KEY = 'dakar_scholarship_user';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
};

type ApiListResponse<T> = {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type BackendUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
};

type BackendDocument = {
  id: string;
  name: string;
  type: string;
  fileType: string;
  size: number;
  url: string;
  uploadedAt: string;
};

type BackendApplication = {
  id: string;
  reference: string;
  userId: string;
  status: string;
  university: string;
  program: string;
  level: string;
  year: string;
  amount: string | number;
  motivation: string;
  assignedToId?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  documents?: BackendDocument[];
  user?: BackendUser;
  assignedTo?: BackendUser | null;
};

type BackendNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

type BackendConversation = {
  id: string;
  participants: Array<{ id: string; name: string; role: string }>;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

type BackendMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  read: boolean;
  createdAt: string;
};

type UploadResponse = {
  url: string;
  publicId: string | null;
  format: string;
  bytes: number;
  originalName: string;
  mimeType: string;
};

let refreshPromise: Promise<string | null> | null = null;

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },
  setSession: (user: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  setAccessToken: (accessToken: string) => localStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
  clear: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

function mapRole(role: string): UserRole {
  switch (role.toLowerCase()) {
    case 'student':
      return 'student';
    case 'municipal':
      return 'municipal';
    case 'admin':
      return 'admin';
    default:
      return 'student';
  }
}

function mapStatus(status: string): ApplicationStatus {
  switch (status.toLowerCase()) {
    case 'draft':
      return 'draft';
    case 'submitted':
      return 'submitted';
    case 'review':
      return 'review';
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    default:
      return 'draft';
  }
}

function mapDocumentType(type: string): Document['type'] {
  switch (type.toLowerCase()) {
    case 'diploma':
      return 'diploma';
    case 'student_card':
      return 'student_card';
    case 'transcript':
      return 'transcript';
    case 'enrollment_certificate':
      return 'enrollment_certificate';
    default:
      return 'other';
  }
}

function mapNotificationType(type: string): Notification['type'] {
  switch (type.toLowerCase()) {
    case 'status_update':
      return 'status_update';
    case 'new_message':
      return 'new_message';
    case 'assignment':
      return 'assignment';
    default:
      return 'system';
  }
}

export function mapUser(user: BackendUser): User {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: mapRole(user.role),
    avatar: user.avatar,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
  };
}

function mapDocument(document: BackendDocument): Document {
  return {
    id: document.id,
    name: document.name,
    type: mapDocumentType(document.type),
    fileType: document.fileType,
    size: document.size,
    url: document.url,
    uploadedAt: document.uploadedAt,
  };
}

export function mapApplication(application: BackendApplication): ScholarshipApplication {
  const studentName = application.user
    ? `${application.user.firstName} ${application.user.lastName}`
    : 'Étudiant';

  return {
    id: application.id,
    reference: application.reference,
    studentId: application.user?.id ?? application.userId,
    studentName,
    status: mapStatus(application.status),
    university: application.university,
    program: application.program,
    level: application.level,
    year: application.year,
    amount: Number(application.amount),
    motivation: application.motivation,
    documents: (application.documents ?? []).map(mapDocument),
    assignedTo: application.assignedTo?.id ?? application.assignedToId ?? undefined,
    reviewNote: application.reviewNote ?? undefined,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    submittedAt: application.submittedAt ?? undefined,
  };
}

function mapNotification(notification: BackendNotification): Notification {
  return {
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    type: mapNotificationType(notification.type),
    createdAt: notification.createdAt,
  };
}

function mapConversation(conversation: BackendConversation): Conversation {
  return {
    id: conversation.id,
    participants: conversation.participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      role: mapRole(participant.role),
    })),
    lastMessage: conversation.lastMessage,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount: conversation.unreadCount,
  };
}

function mapMessage(message: BackendMessage): Message {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderName: message.senderName,
    content: message.content,
    read: message.read,
    createdAt: message.createdAt,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  let message = 'Une erreur est survenue';
  try {
    const errorBody = await response.json();
    if (typeof errorBody?.message === 'string') {
      message = errorBody.message;
    } else if (typeof errorBody?.error === 'string') {
      message = errorBody.error;
    } else if (Array.isArray(errorBody?.message)) {
      message = errorBody.message.join(', ');
    }
  } catch {
    message = response.statusText || message;
  }

  throw new Error(message);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    tokenStorage.clear();
    return null;
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    tokenStorage.clear();
    return null;
  }

  const payload = (await response.json()) as { user: BackendUser; accessToken: string; refreshToken: string };
  const user = mapUser(payload.user);
  tokenStorage.setSession(user, payload.accessToken, payload.refreshToken);
  return payload.accessToken;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, retry = true } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && retry) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newAccessToken = await refreshPromise;
    if (newAccessToken) {
      return request<T>(path, { method, body, auth, retry: false });
    }
  }

  return parseResponse<T>(response);
}

export const api = {
  getStoredUser: () => tokenStorage.getUser(),
  clearSession: () => tokenStorage.clear(),
  async login(email: string, password: string) {
    const payload = await request<{ user: BackendUser; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });

    const user = mapUser(payload.user);
    tokenStorage.setSession(user, payload.accessToken, payload.refreshToken);
    return user;
  },
  async register(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const payload = await request<{ user: BackendUser; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: input,
      auth: false,
    });

    const user = mapUser(payload.user);
    tokenStorage.setSession(user, payload.accessToken, payload.refreshToken);
    return user;
  },
  async me() {
    const user = await request<BackendUser>('/auth/me');
    const mapped = mapUser(user);
    localStorage.setItem(USER_KEY, JSON.stringify(mapped));
    return mapped;
  },
  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await request('/auth/logout', {
        method: 'POST',
        body: refreshToken ? { refreshToken } : {},
      });
    } finally {
      tokenStorage.clear();
    }
  },
  async createApplication(input: {
    university: string;
    program: string;
    level: string;
    year: string;
    amount: number;
    motivation: string;
    documents?: Array<{
      name: string;
      type: 'diploma' | 'student_card' | 'transcript' | 'enrollment_certificate' | 'other';
      fileType: string;
      size: number;
      url: string;
    }>;
  }) {
    const response = await request<BackendApplication>('/applications', {
      method: 'POST',
      body: {
        ...input,
        documents: input.documents?.map((document) => ({
          ...document,
          type: document.type.toUpperCase(),
        })),
      },
    });
    return mapApplication(response);
  },
  async updateApplication(id: string, input: {
    university?: string;
    program?: string;
    level?: string;
    year?: string;
    amount?: number;
    motivation?: string;
  }) {
    const response = await request<BackendApplication>(`/applications/${id}`, {
      method: 'PATCH',
      body: input,
    });
    return mapApplication(response);
  },
  async submitApplication(id: string) {
    const response = await request<BackendApplication>(`/applications/${id}/submit`, {
      method: 'POST',
    });
    return mapApplication(response);
  },
  async getMyApplications() {
    const response = await request<ApiListResponse<BackendApplication>>('/applications/my');
    return response.data.map(mapApplication);
  },
  async getApplications(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await request<ApiListResponse<BackendApplication>>(`/applications${query}`);
    return response.data.map(mapApplication);
  },
  async getApplication(id: string) {
    const response = await request<BackendApplication>(`/applications/${id}`);
    return mapApplication(response);
  },
  async updateApplicationStatus(id: string, status: 'approved' | 'rejected' | 'review') {
    const response = await request<BackendApplication>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: { status: status.toUpperCase() },
    });
    return mapApplication(response);
  },
  async getNotifications(limit = 20) {
    const response = await request<ApiListResponse<BackendNotification>>(`/notifications?limit=${limit}`);
    return response.data.map(mapNotification);
  },
  async markNotificationRead(id: string) {
    const response = await request<BackendNotification>(`/notifications/${id}/read`, { method: 'PATCH' });
    return mapNotification(response);
  },
  async markAllNotificationsRead() {
    return request('/notifications/read-all', { method: 'PATCH' });
  },
  async getUsers(params?: { role?: string; search?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.role && params.role !== 'all') searchParams.set('role', params.role.toUpperCase());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    const response = await request<ApiListResponse<BackendUser>>(`/users${query ? `?${query}` : ''}`);
    return response.data.map(mapUser);
  },
  async createMunicipal(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) {
    const response = await request<BackendUser>('/users/municipal', {
      method: 'POST',
      body: input,
    });

    return mapUser(response);
  },
  async updateUser(id: string, input: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  }) {
    const response = await request<BackendUser>(`/users/${id}`, {
      method: 'PATCH',
      body: input,
    });

    return mapUser(response);
  },
  async deleteUser(id: string) {
    return request<BackendUser>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
  async uploadDocument(file: File) {
    const send = async () => {
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      const accessToken = tokenStorage.getAccessToken();
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          return send();
        }
      }

      return parseResponse<UploadResponse>(response);
    };

    return send();
  },
  async getConversations() {
    const response = await request<BackendConversation[]>('/conversations');
    return response.map(mapConversation);
  },
  async getMessages(conversationId: string) {
    const response = await request<BackendMessage[]>(`/conversations/${conversationId}/messages`);
    return response.map(mapMessage);
  },
  async sendMessage(conversationId: string, content: string) {
    const response = await request<BackendMessage>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { content },
    });
    return mapMessage(response);
  },
};

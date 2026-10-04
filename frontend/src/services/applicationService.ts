/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from '../api/axios';
import type { Application } from '../types';

export const applicationService = {
  submitApplication: async (formData: FormData) => {
    const response = await axiosInstance.post(
      "/api/candidates/apply",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getApplicationById: async (id: string): Promise<Application> => {
    const response = await axiosInstance.get(`/api/candidates/${id}`);
    return response.data.data;
  },

  getAllApplications: async (): Promise<Application[]> => {
    const response = await axiosInstance.get("/api/candidates");
    return response.data.data;
  },

  getApplicationsByJobId: async (jobId: number): Promise<Application[]> => {
    const response = await axiosInstance.get(`/api/candidates?jobId=${jobId}`);
    return response.data.data;
  },

  updateApplication: async (id: string, data: Partial<Application>) => {
    const response = await axiosInstance.patch(`/api/candidates/${id}`, data);
    return response.data;
  },

  approveCVAndSchedule: async (applicationId: string) => {
    const response = await axiosInstance.post(
      `/api/cv/${applicationId}/approve-and-schedule`
    );
    return response.data;
  },

  analyzeCv: async (id: string) => {
    const response = await axiosInstance.post(`/api/cv/${id}/screen-cv`);
    return response.data;
  },

  sendTechnicalAssessmentEmail: async (
    applicationId: string,
    data: {
      interviewDate: string;
      interviewTime: string;
      instructions?: string;
    }
  ) => {
    const response = await axiosInstance.post(
      `/api/technical-interview/${applicationId}/send`,
      data
    );
    console.log(response.data);
    return response.data;
  },

  submitTechnicalAssessment: async (
    candidateId: string,
    assessmentData: {
      answers: { [key: number]: string };
      testResults: { [key: number]: any[] };
      timeSpent: number;
      completedAt: string;
      userInfo: {
        name: string;
        email: string;
        phone: string;
        candidateId: string;
      };
    }
  ) => {
    const response = await axiosInstance.post(
      `/api/technical-interview/${candidateId}/submit`,
      assessmentData
    );
    return response.data;
  },

  getTechnicalAssessment: async (applicationId: string) => {
    const response = await axiosInstance.get(
      `/api/technical-interview/${applicationId}`
    );
    return response.data;
  },

  sendTechnicalInterviewPassedEmail: async (
    applicationId: string,
    data: {
      interviewDate: string;
      interviewTime: string;
      instructions?: string;
    }
  ) => {
    const response = await axiosInstance.post(
      `/api/technical-interview/${applicationId}/passed`,
      data
    );
    return response.data;
  },

  sendHRInterviewEmail: async (
    applicationId: string,
    data: {
      interviewDate: string;
      interviewTime: string;
      instructions?: string;
      meetLink?: string;
    }
  ) => {
    const response = await axiosInstance.post(
      `/api/candidates/${applicationId}/send-hr-interview`,
      data
    );
    return response.data;
  },

  sendHRInterviewPassedEmail: async (applicationId: string) => {
    const response = await axiosInstance.post(
      `/api/candidates/${applicationId}/hr-interview-passed`
    );
    return response.data;
  },

  sendCVRejectionEmail: async (
    applicationId: string,
    rejectionReason: string
  ) => {
    const response = await axiosInstance.post(
      `/api/candidates/${applicationId}/cv-rejection`,
      {
        rejectionReason,
      }
    );
    return response.data;
  },

  sendTechnicalRejectionEmail: async (
    applicationId: string,
    rejectionReason: string
  ) => {
    const response = await axiosInstance.post(
      `/api/candidates/${applicationId}/technical-rejection`,
      {
        rejectionReason,
      }
    );
    return response.data;
  },

  sendHRRejectionEmail: async (
    applicationId: string,
    rejectionReason: string
  ) => {
    const response = await axiosInstance.post(
      `/api/candidates/${applicationId}/hr-rejection`,
      {
        rejectionReason,
      }
    );
    return response.data;
  },
};

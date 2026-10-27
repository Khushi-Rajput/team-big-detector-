import { apiClient } from "./client";
import {
  mockResumes,
  mockAnalyses,
  findMockResume,
  listMockResumesShallow,
} from "@/mock/resumes";
import { mockDelay } from "@/mock/_helpers";

export const resumesApi = {
  list: async () => {
    try {
      const res = await apiClient.get("/resumes");
      if (res.data?.resumes) return res.data;
    } catch {
      // fallback
    }
    await mockDelay();
    return { resumes: listMockResumesShallow() };
  },

  get: async (id) => {
    try {
      const res = await apiClient.get(`/resumes/${id}`);
      if (res.data?.resume) return res.data;
    } catch {
      // fallback
    }
    await mockDelay();
    const resume = findMockResume(id);
    if (!resume) throw { status: 404, message: "Resume not found" };
    return {
      resume: {
        _id: resume._id,
        title: resume.title,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        currentVersionId: resume.currentVersionId,
      },
      versions: resume.versions,
    };
  },

  getVersion: async (id, versionId) => {
    try {
      const res = await apiClient.get(`/resumes/${id}/versions/${versionId}`);
      if (res.data?.version) return res.data;
    } catch {
      // fallback
    }
    await mockDelay();
    const resume = findMockResume(id);
    const version = resume?.versions.find((v) => v._id === versionId);
    if (!version) throw { status: 404, message: "Version not found" };
    return { version };
  },

  upload: async (file, title) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("resume", file);
      if (title) fd.append("title", title);
      const res = await apiClient.post("/resumes", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.resume) return res.data;
    } catch {
      // fallback
    }
    await mockDelay(800);
    const resume = mockResumes[0];
    return {
      resume: { ...resume, title: title || file?.name || resume.title },
    };
  },

  remove: async (id) => {
    try {
      await apiClient.delete(`/resumes/${id}`);
      return { ok: true };
    } catch {
      await mockDelay();
      return { ok: true };
    }
  },

  analyze: async (id, { versionId, targetRole } = {}) => {
    try {
      const res = await apiClient.post(`/resumes/${id}/analyze`, { versionId, targetRole });
      if (res.data?.analysis) return res.data;
    } catch {
      // fallback
    }
    await mockDelay(1200);
    const analysis =
      mockAnalyses[versionId] || mockAnalyses[Object.keys(mockAnalyses)[0]];
    return { analysis };
  },

  analyses: async (id) => {
    try {
      const res = await apiClient.get(`/resumes/${id}/analyses`);
      if (res.data?.analyses) return res.data;
    } catch {
      // fallback
    }
    await mockDelay();
    const resume = findMockResume(id);
    const analyses = (resume?.versions || [])
      .map((v) => mockAnalyses[v._id])
      .filter(Boolean);
    return { analyses };
  },

  analysisForVersion: async (id, versionId) => {
    try {
      const res = await apiClient.get(`/resumes/${id}/versions/${versionId}/analysis`);
      if (res.data?.analysis) return res.data;
    } catch {
      // fallback
    }
    await mockDelay();
    const analysis = mockAnalyses[versionId];
    if (!analysis) throw { status: 404, message: "No analysis for this version" };
    return { analysis };
  },

  rewrite: async (id, { rewriteIds = [], versionId } = {}) => {
    try {
      const res = await apiClient.post(`/resumes/${id}/rewrite`, { rewriteIds, versionId });
      if (res.data?.version) return res.data;
    } catch {
      // fallback
    }
    await mockDelay(900);
    const resume = findMockResume(id);
    const latest = resume?.versions[resume.versions.length - 1];
    return {
      version: latest,
      appliedCount: rewriteIds.length || 4,
    };
  },

  diff: async (id, from, to, mode = "words") => {
    try {
      const res = await apiClient.get(`/resumes/${id}/diff`, { params: { from, to, mode } });
      if (res.data?.hunks) {
        const stats = res.data.stats || {
          added: res.data.hunks.filter((h) => h.type === "add").reduce((acc, h) => acc + h.text.length, 0),
          removed: res.data.hunks.filter((h) => h.type === "remove").reduce((acc, h) => acc + h.text.length, 0),
        };
        return { ...res.data, stats };
      }
    } catch {
      // fallback
    }
    await mockDelay();
    return {
      stats: { added: 154, removed: 68 },
      hunks: [
        { type: "remove", text: "Worked on dashboards for the analytics team." },
        { type: "add", text: "Shipped 4 React analytics dashboards adopted by 12k+ daily users — cut load time 38%." },
        { type: "context", text: "Led migration from Webpack to Vite — build times down from 92s to 11s." },
        { type: "remove", text: "Helped migrate the build system." },
        { type: "add", text: "Owned design-system rewrite (40+ components, full WCAG AA pass)." },
      ],
    };
  },
};

import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type ReportType = "performance" | "safety" | "cost" | "value";

export function useReport(taskId: string, reportType: ReportType) {
  return useQuery({
    queryKey: ["reports", taskId, reportType],
    queryFn: async () => {
      const res = await api.post<Record<string, unknown>>("/reports/generate", null, {
        params: { task_id: taskId, report_type: reportType },
      });
      return res.data;
    },
    enabled: !!taskId,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: async (data: {
      taskId: string;
      reportType: ReportType;
      format: "csv" | "html" | "docx";
    }) => {
      const res = await api.post(`/reports/export/${data.format}`, null, {
        params: { task_id: data.taskId, report_type: data.reportType },
        responseType: "blob",
      });
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = data.format;
      a.download = `${data.reportType}_report.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

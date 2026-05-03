import crminstance from "./axios";

export interface UploadBankLogoArgs {
  file: File | Blob;
  token?: string;
}

/**
 * Upload bank logo
 * POST /api/bank/upload-file?type=view
 * Returns s3UploadedLink (string | null)
 */
export async function uploadBankLogo({ file, token }: UploadBankLogoArgs): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await crminstance.post<{ data?: { s3UploadedLink?: string } }>(
    "bank/upload-file",
    fd,
    {
      params: { type: "view" },
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  return res?.data?.data?.s3UploadedLink ?? null;
}

export interface ImportFileArgs {
  file: File | Blob;
  token?: string;
}

/**
 * Bulk import Cities via .xlsx
 * POST /api/cities/importCities
 * Returns backend payload
 */
export async function importCities<T = any>({ file, token }: ImportFileArgs): Promise<T> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await crminstance.post<T>("cities/importCities", fd, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data;
}

/**
 * Bulk import Companies via .xlsx
 * POST /api/company/importCompanies
 * Returns backend payload
 */
export async function importCompanies<T = any>({ file, token }: ImportFileArgs): Promise<T> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await crminstance.post<T>("company/importCompanies", fd, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res.data;
}

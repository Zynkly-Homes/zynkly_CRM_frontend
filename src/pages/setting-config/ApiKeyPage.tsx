import React from "react";
import { Key } from "lucide-react";
import ApiKeyManagement from "./ApiKeyManagement";

const ApiKeyPage: React.FC = () => (
  <div className="globalPadding">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        <Key className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">API Key Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your platform API keys and access credentials
        </p>
      </div>
    </div>
    <ApiKeyManagement />
  </div>
);

export default ApiKeyPage;

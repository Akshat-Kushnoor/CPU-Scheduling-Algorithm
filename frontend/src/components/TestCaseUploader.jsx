// src/components/TestCaseUploader.jsx
import React, { useState } from 'react';

/**
 * TestCaseUploader
 * Props:
 * - onUpload?: (files: { name, type, size, content, parsed?, preview }[]) => void
 */
export default function TestCaseUploader({ onUpload }) {
  const [files, setFiles] = useState([]);

  const handleFiles = async event => {
    const inputFiles = Array.from(event.target.files || []);
    const processed = await Promise.all(
      inputFiles.map(file => readFileWithPreview(file))
    );
    setFiles(processed);
    onUpload?.(processed);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Test Case Uploader
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload .txt or .json files containing process definitions.
          </p>
        </div>
      </div>

      <label
        htmlFor="testcase-input"
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center text-xs text-slate-500 hover:border-indigo-400 hover:bg-indigo-50/60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:border-indigo-400 dark:hover:bg-slate-800/80"
      >
        <span className="mb-1 font-medium text-slate-700 dark:text-slate-200">
          Click to upload or drag and drop
        </span>
        <span className="text-[0.65rem]">
          Accepted formats: <span className="font-mono">.txt</span>,{' '}
          <span className="font-mono">.json</span>
        </span>
        <input
          id="testcase-input"
          type="file"
          accept=".txt,.json"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
      </label>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Preview
          </h3>
          <ul className="space-y-2">
            {files.map(file => (
              <li
                key={file.name}
                className="rounded-lg border border-slate-200 bg-slate-50/80 p-2 text-[0.7rem] text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <pre className="max-h-24 overflow-auto whitespace-pre-wrap rounded bg-slate-900/80 px-2 py-1 text-[0.6rem] text-slate-100 dark:bg-slate-950/80">
                  {file.preview}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function readFileWithPreview(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      let parsed;
      if (file.name.toLowerCase().endsWith('.json')) {
        try {
          parsed = JSON.parse(content);
        } catch {
          parsed = null;
        }
      }

      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        content,
        parsed,
        preview:
          content.length > 500
            ? content.slice(0, 500) + '\n…'
            : content || '(empty file)',
      });
    };
    reader.readAsText(file);
  });
}
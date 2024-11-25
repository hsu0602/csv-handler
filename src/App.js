import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [csvOptions, setCsvOptions] = useState([
    { label: 'HPAI-BSC_Meds-Ins (snapshot)', path: '/summarization dataset snapshot - HPAI-BSC_Meds-Ins.csv' },
    { label: 'kqsong_OASum (snapshot)', path: '/summarization dataset snapshot - kqsong_OASum.csv' },
  ]);
  const [selectedCsv, setSelectedCsv] = useState(null);

  // 加載預設 CSV 文件
  useEffect(() => {
    if (selectedCsv) {
      fetch(selectedCsv.path)
        .then((response) => response.text())
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              setData(result.data);
            },
          });
        })
        .catch((error) => {
          console.error(`無法加載 ${selectedCsv.label}:`, error);
        });
    }
  }, [selectedCsv]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setData(result.data);
            setSelectedRow(null);
            const newCsvOption = {
              label: file.name,
              path: file.name, // 上傳的文件不會存儲在伺服器，因此僅顯示名稱
              data: result.data, // 保存解析後的數據以便直接使用
            };
            setCsvOptions((prev) => [...prev, newCsvOption]);
            setSelectedCsv(newCsvOption); // 自動選擇新上傳的文件
          },
        });
      };
      reader.readAsText(file);
    }
  };

  const handleRowSelection = (e) => {
    const rowIndex = e.target.value;
    setSelectedRow(data[rowIndex]);
  };

  const handleCsvSelection = (e) => {
    const csvIndex = e.target.value;
    const selected = csvOptions[csvIndex];
    setSelectedCsv(selected);
    if (selected.data) {
      // 如果是本地上傳的文件，直接使用解析好的數據
      setData(selected.data);
    }
  };

  const formatText = (text) => {
    if (!text) return '';
    // 處理跳脫字元，將 \n 替換為真正的換行，其他跳脫字元也可處理
    const normalizedText = text
    .replace(/\\n/g, '\n') // 將 \n 替換為換行符
    .replace(/\\t/g, '    ') // 將 \t 替換為 4 個空格
    .replace(/\\'/g, "'") // 將 \' 替換為單引號
    .replace(/\\"/g, '"') // 將 \" 替換為雙引號
    .replace(/\\\\/g, '\\'); // 將 \\ 替換為反斜杠
      // 如果是列表（以 [ 開頭並以 ] 結尾）
    if (normalizedText.startsWith('[') && normalizedText.endsWith(']')) {
      return normalizedText
        .slice(1, -1) // 去掉開頭的 [ 和結尾的 ]
        .replace(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/g, ',\n'); // 僅匹配不在引號內的逗號
    }
      return normalizedText.replace(/(study\d+:)/gi, '\n\n    $1');
    };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">CSV Viewer</h1>

      {/* CSV 選擇清單 */}
      <div className="mb-4">
        <label htmlFor="csv-select" className="form-label">
          選擇 CSV 文件
        </label>
        <select
          id="csv-select"
          className="form-select"
          onChange={handleCsvSelection}
          defaultValue=""
        >
          <option value="" disabled>
            -- 請選擇 --
          </option>
          {csvOptions.map((option, index) => (
            <option key={index} value={index}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 上傳 CSV 文件 */}
      <div className="mb-4">
        <label htmlFor="file-upload" className="form-label">
          上傳新的 CSV 文件
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="form-control"
        />
      </div>

      {/* 選擇行 */}
      {data.length > 0 && (
        <div className="mb-4">
          <label htmlFor="row-select" className="form-label">
            選擇一行數據
          </label>
          <select
            id="row-select"
            onChange={handleRowSelection}
            className="form-select"
            defaultValue=""
          >
            <option value="" disabled>
              -- 請選擇 --
            </option>
            {data.map((_, index) => (
              <option key={index} value={index}>
                第 {index + 1} 筆
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 顯示選中行數據 */}
      {selectedRow && (
        <div className="table-responsive">
          <h2 className="text-center mb-3">選中的數據</h2>
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>欄位名稱</th>
                <th>內容</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(selectedRow).map(([key, value], index) => (
                <tr key={index}>
                  <td>{key}</td>
                  <td style={{ whiteSpace: 'pre-line' }}>{formatText(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;

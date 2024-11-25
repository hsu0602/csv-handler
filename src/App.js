import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const defaultCSVPath = '/default.csv'; // 預設 CSV 文件路徑

  // 加載預設 CSV 文件
  useEffect(() => {
    fetch(defaultCSVPath)
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
        console.error('預設 CSV 文件加載失敗:', error);
      });
  }, [defaultCSVPath]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setData(result.data);
          setSelectedRow(null);
        },
      });
    }
  };

  const handleRowSelection = (e) => {
    const rowIndex = e.target.value;
    setSelectedRow(data[rowIndex]);
  };

  // 處理文本：將冒號分割的部分換行並縮進
  const formatText = (text) => {
    if (!text) return '';
    return text.replace(/(\w+:)/g, '\n\n    $1');
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">CSV Viewer</h1>

      <div className="mb-4">
        <label htmlFor="file-upload" className="form-label">
          上傳 CSV 文件
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="form-control"
        />
      </div>

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
                  <td style={{ whiteSpace: 'pre-line' }}>
                    {formatText(value)}
                  </td>
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

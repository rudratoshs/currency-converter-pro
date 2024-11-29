"use client";

import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { fetchExchangeRates, fetchAllCurrencies } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const validateImage = async (url: string) => {
  try {
    const response = await fetch(url, { mode: 'no-cors' });
    return response.ok || response.type === 'opaque';
  } catch {
    return false;
  }
};

const CurrencyRatesTableCard = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const currencies = await fetchAllCurrencies();
        const rates = await fetchExchangeRates(baseCurrency);

        const data = await Promise.all(
          Object.keys(currencies).map(async (code) => {
            const flagUrl = `https://flagcdn.com/w40/${code.slice(0, 2).toLowerCase()}.png`;
            const isValidFlag = await validateImage(flagUrl);

            return isValidFlag
              ? {
                  flag: flagUrl,
                  country: currencies[code]?.name || "Unknown",
                  currency: currencies[code]?.name || "Unknown",
                  rate: rates[code.toLowerCase()] || "N/A",
                }
              : null;
          })
        );

        setRowData(data.filter((row) => row !== null)); // Filter out invalid flags
      } catch (error) {
        console.error("Failed to fetch currency rates", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [baseCurrency]);

  const columnDefs = [
    {
      headerName: "Flag",
      field: "flag",
      width: 80,
      cellRenderer: (params: any) => (
        <img
          src={params.value}
          alt="Flag"
          style={{ width: "30px", height: "20px", borderRadius: "3px" }}
        />
      ),
    },
    { headerName: "Country", field: "country", width: 150 },
    { headerName: "Currency", field: "currency", width: 150 },
    { headerName: "Exchange Rate", field: "rate", width: 100, sortable: true },
  ];

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Currency Rates Table</span>
          <Select value={baseCurrency} onValueChange={setBaseCurrency}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select base currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - United States Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
              <SelectItem value="INR">INR - Indian Rupee</SelectItem>
              {/* Add more options dynamically if needed */}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">Loading...</div>
        ) : (
          <div className="ag-theme-alpine" style={{ height: "400px", width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              animateRows={true}
              defaultColDef={{
                flex: 1,
                minWidth: 100,
                filter: true,
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyRatesTableCard;
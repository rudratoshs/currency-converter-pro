"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { fetchExchangeRates } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const geoUrl = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

const countryCurrencies = {
  USA: "USD",
  GBR: "GBP",
  JPN: "JPY",
  FRA: "EUR",
  CHN: "CNY",
  AUS: "AUD",
  CAN: "CAD",
  IND: "INR",
  BRA: "BRL",
};

const WorldCurrencyMap = () => {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRates = async () => {
      setLoading(true);
      try {
        const data = await fetchExchangeRates(baseCurrency);
        setRates(data);
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRates();
  }, [baseCurrency]);

  const colorScale = scaleLinear<string>()
    .domain([0.5, 1, 2])
    .range(["#ffedea", "#ff8a5b", "#ff3333"]);

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>World Currency Map</span>
          <Select value={baseCurrency} onValueChange={setBaseCurrency}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select base currency" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(countryCurrencies).map(([code, currency]) => (
                <SelectItem key={code} value={currency}>
                  {code} - {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">Loading...</div>
        ) : (
          <>
            <ComposableMap projection="geoMercator">
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const isoCode = geo.properties.ISO_A3;
                    const currencyCode = countryCurrencies[isoCode as keyof typeof countryCurrencies];
                    const rate = currencyCode ? rates[currencyCode.toLowerCase()] : null;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={rate ? colorScale(rate) : "#F5F4F6"}
                        stroke="#D6D6DA"
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: "#F53" },
                          pressed: { outline: "none" },
                        }}
                        data-tooltip-id="geo-tooltip"
                        data-tooltip-html={`Country: ${geo.properties.ADMIN}<br>Currency: ${
                          currencyCode || "N/A"
                        }<br>Rate: ${rate ? rate.toFixed(4) : "N/A"}`}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
            <ReactTooltip id="geo-tooltip" />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WorldCurrencyMap;
import { useState, useEffect } from "react";
import { getNestedValue } from "./controller";

export const useSearch = (data, fields, minLengthToShow = 1) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDataShown, setIsDataShown] = useState(true);
  const handleSearch = (term) => setSearchTerm(term);
  const filteredData = data.filter((item) => fields.some((field) => getNestedValue(item, field)?.toString().toLowerCase().includes(searchTerm.toLowerCase())));

  useEffect(() => {
    setIsDataShown(filteredData.length >= minLengthToShow);
  }, [filteredData, minLengthToShow]);

  return { searchTerm, handleSearch, filteredData, isDataShown };
};

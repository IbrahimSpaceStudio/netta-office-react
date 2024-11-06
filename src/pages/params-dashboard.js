import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import { useFormat, useContent, useDevmode } from "@ibrahimstudio/react";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { getNestedValue, inputValidator } from "../libs/plugins/controller";
import { useOptions, useOdontogram } from "../libs/plugins/helper";
import { inputSchema, errorSchema } from "../libs/sources/common";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import OdontoForm, { OdontoHistory, HistoryTr, OdontoGram, GramSet, GramRows, GramBlock, GramMarker, OdontoCondition, ConditionLi } from "../components/contents/odonto-form";
import Grid, { GridItem } from "../components/contents/grid";
import Fieldset from "../components/input-controls/inputs";
import { SubmitForm } from "../components/input-controls/forms";
import OnpageForm, { FormFooter } from "../components/input-controls/onpage-forms";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";
import TabGroup from "../components/input-controls/tab-group";
import TabSwitch from "../components/input-controls/tab-switch";
import { LoadingContent } from "../components/feedbacks/screens";
import { Arrow, Plus, NewTrash, Check, Filter } from "../components/contents/icons";
import Pagination from "../components/navigations/pagination";

const DashboardParamsPage = ({ parent, slug }) => {
  const { params } = useParams();
  const navigate = useNavigate();
  const { toPathname, toTitleCase } = useContent();
  const { log } = useDevmode();
  const { newDate, newPrice } = useFormat();
  const { isLoggedin, secret, idoutlet, level, cctr } = useAuth();
  const { apiRead, apiCrud } = useApi();
  const { showNotifications } = useNotifications();
  const { limitopt, paymenttypeopt, orderstatopt, stockoutstatopt, diagnoseopt } = useOptions();
  const { topleft, topright, centertopleft, centertopright, centerbotleft, centerbotright, botleft, botright } = useOdontogram();

  const pageid = parent && slug && params ? `params-${toPathname(parent)}-${toPathname(slug)}-${toPathname(params)}` : "params-dashboard";

  const [pageTitle, setPageTitle] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDataShown, setIsDataShown] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [limit, setLimit] = useState(5);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(idoutlet);

  const [tabId, setTabId] = useState("1");
  const [subTabId, setSubTabId] = useState("1");
  const [stockHistoryData, setStockHistoryData] = useState([]);
  const [allBranchData, setAllBranchData] = useState([]);
  const [orderDetailData, setOrderDetailData] = useState([]);
  const [rscodeData, setRscodeData] = useState([]);
  const [anamesaData, setAnamesaData] = useState([]);
  const [odontogramData, setOdontogramData] = useState([]);
  const [inspectData, setInspectData] = useState([]);
  const [photoMedic, setPhotoMedic] = useState([]);
  const [alkesData, setAlkesData] = useState([]);
  const [recipeData, setRecipeData] = useState([]);
  const [historyOrderData, setHistoryOrderData] = useState([]);
  const [allDiagnoseData, setAllDiagnoseData] = useState([]);
  const [rkmDiagnosaData, setRkmDiagnosaData] = useState([]);
  const [isFormFetching, setIsFormFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMode, setSelectedMode] = useState("add");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [allservicedata, setAllservicedata] = useState([]);
  const [branchDentistData, setBranchDentistData] = useState([]);
  const [allStockData, setAllStockData] = useState([]);
  const [categoryStockData, setCategoryStockData] = useState([]);
  const [fvaListData, setFvaListData] = useState([]);
  const [labData, setLabData] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [conditionData, setConditionData] = useState([]);
  const [userConditionData, setUserConditionData] = useState(null);
  const [odontoHistoryData, setOdontoHistoryData] = useState([]);
  const [selectedToothNo, setSelectedToothNo] = useState(null);
  const [programDetailData, setProgramDetailData] = useState([]);
  const [jobDetailData, setJobDetailData] = useState([]);

  const [inputData, setInputData] = useState({ ...inputSchema });
  const [errors, setErrors] = useState({ ...errorSchema });
  const [dmfT, setDmfT] = useState("0");
  const [defT, setDefT] = useState("0");

  const goBack = () => navigate(-1);
  const handlePageChange = (page) => setCurrentPage(page);
  const handleImageSelect = (file) => setSelectedImage(file);
  const handleBranchChange = (value) => setSelectedBranch(value);
  const handleLimitChange = (value) => {
    setLimit(value);
    setCurrentPage(1);
  };

  const restoreInputState = () => {
    setInputData({ ...inputSchema });
    setErrors({ ...errorSchema });
  };

  const handleAddRow = (field) => {
    let newitems = {};
    if (field === "alkesitem") {
      newitems = { idstock: "", categorystock: "", subcategorystock: "", sku: "", itemname: "", unit: "", qty: "", status: "" };
    } else if (field === "order") {
      newitems = { service: "", servicetype: "", price: "" };
    }
    const updatedvalues = [...inputData[field], newitems];
    const updatederrors = errors[field] ? [...errors[field], newitems] : [{}];
    setInputData({ ...inputData, [field]: updatedvalues });
    setErrors({ ...errors, [field]: updatederrors });
  };

  const handleRmvRow = (field, index) => {
    const updatedrowvalue = [...inputData[field]];
    const updatedrowerror = errors[field] ? [...errors[field]] : [];
    updatedrowvalue.splice(index, 1);
    updatedrowerror.splice(index, 1);
    setInputData({ ...inputData, [field]: updatedrowvalue });
    setErrors({ ...errors, [field]: updatedrowerror });
  };

  const openForm = () => {
    setSelectedMode("add");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    restoreInputState();
    setIsFormOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({ ...prevState, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    if (name === "typepayment") {
      if (value === "cash") {
        setInputData((prevState) => ({ ...prevState, bank_code: "CASH" }));
      } else if (value === "indodana") {
        setInputData((prevState) => ({ ...prevState, bank_code: "INDODANA" }));
      } else if (value === "rata") {
        setInputData((prevState) => ({ ...prevState, bank_code: "RATA" }));
      } else {
        setInputData((prevState) => ({ ...prevState, bank_code: "", status: "0" }));
      }
    }
  };

  const handleRowChange = (field, index, e) => {
    const { name, value } = e.target;
    const updatedvalues = [...inputData[field]];
    const updatederrors = errors[field] ? [...errors[field]] : [];
    updatedvalues[index] = { ...updatedvalues[index], [name]: value };
    if (field === "order" && name === "servicetype" && value !== "RESERVATION") {
      const selectedService = updatedvalues[index].service;
      const serviceData = allservicedata.find((service) => service["Nama Layanan"].servicename === selectedService);
      if (serviceData) {
        const selectedType = serviceData["Jenis Layanan"].find((type) => type.servicetypename === value);
        if (selectedType) {
          updatedvalues[index].price = selectedType.serviceprice || "";
        }
      }
    }
    if (field === "alkesitem" && name === "itemname") {
      const selectedItem = allStockData.find((s) => s.itemname === value);
      if (selectedItem) {
        updatedvalues[index].idstock = selectedItem.idstock || "";
        updatedvalues[index].sku = selectedItem.sku || "";
        updatedvalues[index].unit = selectedItem.unit || "";
      }
    }
    if (!updatederrors[index]) {
      updatederrors[index] = {};
    } else {
      updatederrors[index] = { ...updatederrors[index], [name]: "" };
    }
    setInputData({ ...inputData, [field]: updatedvalues });
    setErrors({ ...errors, [field]: updatederrors });
  };

  const handleSort = (data, setData, params, type) => {
    const newData = [...data];
    const compare = (a, b) => {
      const valueA = getNestedValue(a, params);
      const valueB = getNestedValue(b, params);
      if (type === "date") {
        return new Date(valueA) - new Date(valueB);
      } else if (type === "number") {
        return valueA - valueB;
      } else if (type === "text") {
        return valueA.localeCompare(valueB);
      } else {
        return 0;
      }
    };
    if (!sortOrder || sortOrder === "desc") {
      newData.sort(compare);
      setSortOrder("asc");
    } else {
      newData.sort((a, b) => compare(b, a));
      setSortOrder("desc");
    }
    setData(newData);
  };

  const fetchData = async () => {
    const errormsg = `Terjadi kesalahan saat memuat halaman ${toTitleCase(slug)} ${toTitleCase(params)}. Mohon periksa koneksi internet anda dan coba lagi.`;
    setIsFetching(true);
    const formData = new FormData();
    const addtFormData = new FormData();
    let data;
    let addtdata;
    try {
      switch (slug) {
        case "PROGRAM":
          formData.append("data", JSON.stringify({ secret, idprogram: params }));
          data = await apiRead(formData, "kpi", "viewprogramdetail");
          if (data && data.data && data.data.length > 0) {
            setProgramDetailData(data.data);
            setPageTitle(`Detail Program #${params}`);
            setIsDataShown(true);
          } else {
            setProgramDetailData([]);
            setPageTitle("");
            setIsDataShown(false);
          }
          break;
        case "JOB":
          formData.append("data", JSON.stringify({ secret, idprogdetail: params }));
          data = await apiRead(formData, "kpi", "viewjobdetail");
          if (data && data.data && data.data.length > 0) {
            setJobDetailData(data.data);
            setPageTitle(`Detail Job #${params}`);
            setIsDataShown(true);
          } else {
            setJobDetailData([]);
            setPageTitle("");
            setIsDataShown(false);
          }
          break;
        default:
          setIsDataShown(false);
          break;
      }
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchAdditionalData = async () => {
    const errormsg = "Terjadi kesalahan saat memuat data tambahan. Mohon periksa koneksi internet anda dan coba lagi.";
    const formData = new FormData();
    const addtFormData = new FormData();
    formData.append("data", JSON.stringify({ secret }));
    setIsOptimizing(true);
    try {
      // const servicedata = await apiRead(formData, "office", "searchservice");
      // if (servicedata && servicedata.data && servicedata.data.length > 0) {
      //   setAllservicedata(servicedata.data);
      // } else {
      //   setAllservicedata([]);
      // }
      // const catstockdata = await apiRead(formData, "office", "searchcategorystock");
      // if (catstockdata && catstockdata.data && catstockdata.data.length > 0) {
      //   setCategoryStockData(catstockdata.data);
      // } else {
      //   setCategoryStockData([]);
      // }
      // const fvadata = await apiRead(formData, "office", "viewlistva");
      // const allfvadata = fvadata.data;
      // const staticdata = [{ code: "INVOICE", country: "ID", currency: "IDR", is_activated: true, name: "Invoice Xendit" }];
      // const mergedvadata = [...staticdata, ...allfvadata];
      // const filteredfvadata = mergedvadata.filter((va) => va.is_activated === true);
      // if (filteredfvadata && filteredfvadata.length > 0) {
      //   setFvaListData(filteredfvadata);
      // } else {
      //   setFvaListData([]);
      // }
      // addtFormData.append("data", JSON.stringify({ secret, kodeoutlet: cctr }));
      // const dentistdata = await apiRead(addtFormData, "office", "viewdentistoutlet");
      // if (dentistdata && dentistdata.data && dentistdata.data.length > 0) {
      //   setBranchDentistData(dentistdata.data);
      // } else {
      //   setBranchDentistData([]);
      // }
      // const branchdata = await apiRead(formData, "office", "viewoutletall");
      // if (branchdata && branchdata.data && branchdata.data.length > 0) {
      //   setAllBranchData(branchdata.data);
      // } else {
      //   setAllBranchData([]);
      // }
      // const stockdata = await apiRead(formData, "office", "searchstock");
      // if (stockdata && stockdata.data && stockdata.data.length > 0) {
      //   setAllStockData(stockdata.data);
      // } else {
      //   setAllStockData([]);
      // }
      // addtFormData.append("data", JSON.stringify({ secret, idmedics: params }));
      // const rscodedata = await apiRead(addtFormData, "office", "searchrscode");
      // if (rscodedata && rscodedata.data && rscodedata.data.length > 0) {
      //   setRscodeData(rscodedata.data);
      // } else {
      //   setRscodeData([]);
      // }
      // const diagdata = await apiRead(formData, "office", "viewdiagnosis");
      // if (diagdata && diagdata.data && diagdata.data.length > 0) {
      //   setAllDiagnoseData(diagdata.data);
      // } else {
      //   setAllDiagnoseData([]);
      // }
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    let requiredFields = [];
    switch (slug) {
      case "REKAM MEDIS":
        requiredFields = [];
        break;
      default:
        requiredFields = [];
        break;
    }
    const validationErrors = inputValidator(inputData, requiredFields);
    if (Object.keys(validationErrors).length > 0) {
      if (slug === "REKAM MEDIS" && tabId === "2" && subTabId === "1") {
        showNotifications("danger", "Mohon isi semua nilai DMF dan DeF sebelum menyimpan.");
      } else {
        setErrors(validationErrors);
      }
      return;
    }
    const action = e.nativeEvent.submitter.getAttribute("data-action");
    const confirmmsg = action === "update" ? `Apakah anda yakin untuk menyimpan perubahan pada ${toTitleCase(slug)}?` : `Apakah anda yakin untuk menambahkan data baru pada ${toTitleCase(slug)}?`;
    const successmsg = action === "update" ? `Selamat! Perubahan anda pada ${toTitleCase(slug)} berhasil disimpan.` : `Selamat! Data baru berhasil ditambahkan pada ${toTitleCase(slug)}.`;
    const errormsg = action === "update" ? "Terjadi kesalahan saat menyimpan perubahan. Mohon periksa koneksi internet anda dan coba lagi." : "Terjadi kesalahan saat menambahkan data. Mohon periksa koneksi internet anda dan coba lagi.";
    const confirm = window.confirm(confirmmsg);
    if (!confirm) {
      return;
    }
    setIsSubmitting(true);
    try {
      let submittedData;
      switch (slug) {
        case "REKAM MEDIS":
          break;
        default:
          break;
      }
      const formData = new FormData();
      formData.append("data", JSON.stringify(submittedData));
      formData.append("fileimg", selectedImage);
      if (action === "update") {
        formData.append("idedit", selectedData);
      }
      await apiCrud(formData, "office", endpoint);
      showNotifications("success", successmsg);
      log("submitted data:", submittedData);
      if (slug === "REKAM MEDIS" && tabId === "2" && subTabId === "1") {
        setOdontoHistoryData(odontoHistoryData.filter((item) => item["tooth"].idconditiontooth !== ""));
      } else if (slug === "REKAM MEDIS" && tabId === "1" && subTabId === "4") {
        closeForm();
      }
      await fetchData();
      await fetchAdditionalData();
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterData = () => {
    return stockHistoryData.filter((item) => {
      const itemDate = new Date(item.logstockcreate);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const formatDate = (date) => {
    return date.toISOString().slice(0, 16);
  };

  const renderContent = () => {
    switch (slug) {
      case "PROGRAM":
        return (
          <Fragment>
            <DashboardHead title={isFetching ? "Memuat data ..." : isDataShown ? pageTitle : "Tidak ada data."} />
            <DashboardToolbar>
              <DashboardTool>
                <Button id={`${pageid}-back-previous-page`} buttonText="Kembali" radius="md" onClick={goBack} startContent={<Arrow direction="left" />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(programDetailData, setProgramDetailData, "sourcename", "text")}>
                      Nama PIC (source)
                    </TH>
                    <TH isSorted onSort={() => handleSort(programDetailData, setProgramDetailData, "progname", "text")}>
                      Nama Program
                    </TH>
                    <TH isSorted onSort={() => handleSort(programDetailData, setProgramDetailData, "channel", "text")}>
                      Channel
                    </TH>
                    <TH isSorted onSort={() => handleSort(programDetailData, setProgramDetailData, "target", "text")}>
                      Target
                    </TH>
                    <TH isSorted onSort={() => handleSort(programDetailData, setProgramDetailData, "capaian", "text")}>
                      Capaian
                    </TH>
                    <TH isSorted onSort={() => handleSort(programDetailData, setProgramDetailData, "bobot", "text")}>
                      Bobot
                    </TH>
                    <TH isSorted onSort={() => handleSort(programDetailData, setProgramDetailData, "skor", "text")}>
                      Skor
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {programDetailData.map((data, index) => (
                    <TR key={index}>
                      <TD>{data.sourcename}</TD>
                      <TD>{data.progname}</TD>
                      <TD>{data.channel}</TD>
                      <TD>{data.target}</TD>
                      <TD>{data.capaian}</TD>
                      <TD>{data.bobot}</TD>
                      <TD>{data.skor}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
          </Fragment>
        );
      case "JOB":
        return (
          <Fragment>
            <DashboardHead title={isFetching ? "Memuat data ..." : isDataShown ? pageTitle : "Tidak ada data."} />
            <DashboardToolbar>
              <DashboardTool>
                <Button id={`${pageid}-back-previous-page`} buttonText="Kembali" radius="md" onClick={goBack} startContent={<Arrow direction="left" />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(jobDetailData, setJobDetailData, "actioncreate", "date")}>
                      Tanggal Pengerjaan
                    </TH>
                    <TH isSorted onSort={() => handleSort(jobDetailData, setJobDetailData, "description", "text")}>
                      Deskripsi Pengerjaan
                    </TH>
                    <TH isSorted onSort={() => handleSort(jobDetailData, setJobDetailData, "note", "text")}>
                      Catatan
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {jobDetailData.map((data, index) => (
                    <TR key={index}>
                      <TD>{newDate(data.actioncreate, "id")}</TD>
                      <TD>{data.description}</TD>
                      <TD>{data.note}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
          </Fragment>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug, params, startDate, endDate, currentPage, limit, selectedBranch, tabId, subTabId]);

  useEffect(() => {
    if (slug === "STOCK") {
      setIsDataShown(filterData().length > 0);
    }
  }, [slug, stockHistoryData, startDate, endDate]);

  useEffect(() => {
    if (slug === "REKAM MEDIS" && tabId === "2" && subTabId === "1") {
      const dmfTotal = (parseInt(inputData.dmf_d || "0", 10) + parseInt(inputData.dmf_m || "0", 10) + parseInt(inputData.dmf_f || "0", 10)).toString();
      const defTotal = (parseInt(inputData.def_d || "0", 10) + parseInt(inputData.def_e || "0", 10) + parseInt(inputData.def_f || "0", 10)).toString();
      setDmfT(dmfTotal);
      setDefT(defTotal);
      setSelectedMode(userConditionData ? "update" : "add");
      setSelectedData(userConditionData ? userConditionData.idcondition : null);
    }
  }, [slug, tabId, subTabId, inputData, userConditionData]);

  useEffect(() => {
    if (slug === "REKAM MEDIS") {
      fetchAdditionalData();
    }
  }, [slug, params]);

  useEffect(() => {
    setSortOrder("asc");
    if (slug === "STOCK") {
      setStartDate(new Date(new Date().setMonth(new Date().getMonth() - 1)));
      setEndDate(new Date());
    }
  }, [slug]);

  useEffect(() => {
    log("new history array:", odontoHistoryData);
  }, [odontoHistoryData]);

  useEffect(() => {
    log("selected mode:", selectedMode);
    log("selected data:", selectedData);
  }, [selectedMode, selectedData]);

  if (!isLoggedin) {
    return <Navigate to="/login" />;
  }

  return (
    <Pages title={`${pageTitle} - Dashboard`} loading={isOptimizing}>
      <DashboardContainer>{renderContent()}</DashboardContainer>
    </Pages>
  );
};

export default DashboardParamsPage;

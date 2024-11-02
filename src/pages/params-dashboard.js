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
        case "ORDER CUSTOMER":
          formData.append("data", JSON.stringify({ secret, idtransaction: params }));
          data = await apiRead(formData, "office", "viewdetailorder");
          if (data && data.data && data.data.length > 0) {
            setOrderDetailData(data.data);
            setPageTitle(`Detail Order #${params}`);
            setIsDataShown(true);
          } else {
            setOrderDetailData([]);
            setPageTitle("");
            setIsDataShown(false);
          }
          break;
        case "STOCK":
          const offset = (currentPage - 1) * limit;
          formData.append("data", JSON.stringify({ secret, stockname: params.toUpperCase(), limit, hal: offset, idoutlet: selectedBranch }));
          data = await apiRead(formData, "office", "logstock");
          if (data && data.data && data.data.length > 0) {
            setStockHistoryData(data.data);
            setTotalPages(data.TTLPage);
            setPageTitle(`Histori Stok ${toTitleCase(params)}`);
            setIsDataShown(true);
          } else {
            setStockHistoryData([]);
            setTotalPages(0);
            setPageTitle("Histori Stok Tidak Ditemukan");
            setIsDataShown(false);
          }
          addtFormData.append("data", JSON.stringify({ secret }));
          addtdata = await apiRead(addtFormData, "office", "viewoutletall");
          if (addtdata && addtdata.data && addtdata.data.length > 0) {
            setAllBranchData(addtdata.data);
          } else {
            setAllBranchData([]);
          }
          break;
        case "REKAM MEDIS":
          setPageTitle(`Rekam Medis #${params}`);
          let selecteddata;
          switch (tabId) {
            case "1":
              formData.append("data", JSON.stringify({ secret, iduser: params }));
              switch (subTabId) {
                case "1":
                  data = await apiRead(formData, "office", "viewanamnesa");
                  if (data && data.data && data.data.length > 0) {
                    selecteddata = data.data[0];
                    setSelectedData(selecteddata.idanamnesa);
                    setAnamesaData(data.data);
                    setInputData({ histori_illness: selecteddata.histori_illness, current_illness: selecteddata.current_illness, gravida: selecteddata.gravida, main_complaint: selecteddata.main_complaint, additional_complaint: selecteddata.additional_complaint, alergi_gatal: selecteddata.alergi_gatal, alergi_debu: selecteddata.alergi_debu, alergi_obat: selecteddata.alergi_obat, alergi_makanan: selecteddata.alergi_makanan, alergi_lainnya: selecteddata.alergi_lainnya });
                    setSelectedMode("update");
                  } else {
                    setSelectedData(null);
                    setAnamesaData([]);
                    setInputData({ histori_illness: "", current_illness: "", gravida: "", main_complaint: "", additional_complaint: "", alergi_gatal: "", alergi_debu: "", alergi_obat: "", alergi_makanan: "", alergi_lainnya: "" });
                    setSelectedMode("add");
                  }
                  break;
                case "2":
                  data = await apiRead(formData, "office", "viewodontogram");
                  if (data && data.data && data.data.length > 0) {
                    selecteddata = data.data[0];
                    setSelectedData(selecteddata.idodontogram);
                    setOdontogramData(data.data);
                    setInputData({ occlusi: selecteddata.occlusi, palatinus: selecteddata.palatinus, mandibularis: selecteddata.mandibularis, palatum: selecteddata.palatum, diastema: selecteddata.diastema, anomali: selecteddata.anomali, other_odontogram: selecteddata.other });
                    setSelectedMode("update");
                  } else {
                    setSelectedData(null);
                    setOdontogramData([]);
                    setInputData({ occlusi: "", palatinus: "", mandibularis: "", palatum: "", diastema: "", anomali: "", other_odontogram: "" });
                    setSelectedMode("add");
                  }
                  break;
                case "3":
                  data = await apiRead(formData, "office", "viewinspection");
                  if (data && data.data && data.data.length > 0) {
                    selecteddata = data.data[0];
                    setSelectedData(selecteddata.idinspection);
                    setInspectData(data.data);
                    setInputData({ desc: selecteddata.desciption, nadi: selecteddata.pulse, tensi: selecteddata.tension, suhu: selecteddata.temperature, berat_badan: selecteddata.weight, tinggi_badan: selecteddata.height, pernapasan: selecteddata.breath, mata: selecteddata.eye, mulut_gigi: selecteddata.mouth, kulit: selecteddata.skin });
                    setSelectedMode("update");
                  } else {
                    setSelectedData(null);
                    setInspectData([]);
                    setInputData({ desc: "", nadi: "", tensi: "", suhu: "", berat_badan: "", tinggi_badan: "", pernapasan: "", mata: "", mulut_gigi: "", kulit: "" });
                    setSelectedMode("add");
                  }
                  break;
                case "4":
                  data = await apiRead(formData, "office", "viewphoto");
                  if (data && data.data && data.data.length > 0) {
                    setPhotoMedic(data.data);
                  } else {
                    setPhotoMedic([]);
                  }
                  break;
                default:
                  break;
              }
              break;
            case "2":
              switch (subTabId) {
                case "1":
                  formData.append("data", JSON.stringify({ secret, idmedics: params }));
                  data = await apiRead(formData, "office", "viewtoothuser");
                  if (data && data.data && data.data.length > 0) {
                    const conditiondata = data.data[0]["condition"][0];
                    const historydata = data.data[0]["detail"];
                    setUserConditionData(conditiondata);
                    setInputData({ ...inputData, dmf_d: conditiondata.D, dmf_m: conditiondata.M, dmf_f: conditiondata.F, def_d: conditiondata.De, def_e: conditiondata.E, def_f: conditiondata.eF });
                    setOdontoHistoryData(historydata);
                  } else {
                    setUserConditionData(null);
                    setInputData({ ...inputData, dmf_d: "", dmf_m: "", dmf_f: "", def_d: "", def_e: "", def_f: "" });
                    setOdontoHistoryData([]);
                  }
                  addtFormData.append("data", JSON.stringify({ secret }));
                  addtdata = await apiRead(addtFormData, "office", "viewtooth");
                  if (addtdata && addtdata.data && addtdata.data.length > 0) {
                    setConditionData(addtdata.data);
                  } else {
                    setConditionData([]);
                  }
                  break;
                case "2":
                  formData.append("data", JSON.stringify({ secret, iduser: params }));
                  data = await apiRead(formData, "office", "viewdiagnosisuser");
                  if (data && data.data && data.data.length > 0) {
                    selecteddata = data.data[0];
                    setSelectedData(selecteddata.iddiagnosis);
                    setRkmDiagnosaData(data.data);
                    setInputData({ diagnose: selecteddata.diagnosistype, diagnosecode: selecteddata.diagnosiscode, diagnosedetail: selecteddata.diagnosisdetail, note: selecteddata.diagnosisnote });
                    setSelectedMode("update");
                  } else {
                    setSelectedData(null);
                    setRkmDiagnosaData([]);
                    setInputData({ diagnose: "", diagnosecode: "", diagnosedetail: "", note: "" });
                    setSelectedMode("add");
                  }
                  break;
                case "3":
                  const odFormData = new FormData();
                  addtFormData.append("data", JSON.stringify({ secret, idmedics: params }));
                  data = await apiRead(addtFormData, "office", "viewhistoryorder");
                  if (data && data.data && data.data.length > 0) {
                    selecteddata = data.data[0];
                    setSelectedData(selecteddata.idtransaction);
                    setHistoryOrderData(data.data);
                    odFormData.append("data", JSON.stringify({ secret, idtransaction: selecteddata.idtransaction }));
                    const oddata = await apiRead(odFormData, "office", "viewdetailorder");
                    if (oddata && oddata.data && oddata.data.length > 0) {
                      const selectedoddata = oddata.data;
                      setInputData({ name: selecteddata.transactionname, phone: selecteddata.transactionphone, id: selecteddata.idtransaction, dentist: selecteddata.dentist, typepayment: selecteddata.payment === "CASH" ? "cash" : "cashless", bank_code: selecteddata.payment === "CASH" ? "CASH" : selecteddata.payment, status: selecteddata.transactionstatus, order: selectedoddata.map((order) => ({ service: order.service, servicetype: order.servicetype, price: order.price })) });
                    } else {
                      setInputData({ name: selecteddata.transactionname, phone: selecteddata.transactionphone, id: selecteddata.idtransaction, dentist: selecteddata.dentist, typepayment: selecteddata.payment === "CASH" ? "cash" : "cashless", bank_code: selecteddata.payment === "CASH" ? "CASH" : selecteddata.payment, status: selecteddata.transactionstatus, order: [{ service: "", servicetype: "", price: "" }] });
                    }
                    setSelectedMode("update");
                  } else {
                    setSelectedData(null);
                    setHistoryOrderData([]);
                    setInputData({ name: "", phone: "", id: "", dentist: "", typepayment: "", bank_code: "", status: "", order: [] });
                    setSelectedMode("add");
                  }
                  break;
                case "4":
                  formData.append("data", JSON.stringify({ secret, iduser: params }));
                  data = await apiRead(formData, "office", "viewstockoutdetail");
                  if (data && data.data && data.data.length > 0) {
                    selecteddata = data.data;
                    setAlkesData(selecteddata);
                    setInputData({ alkesitem: selecteddata.map((item) => ({ idstock: item.idstock, categorystock: item.categorystock, subcategorystock: item.subcategorystock, sku: item.sku, itemname: item.itemname, unit: item.unit, qty: item.lastqty, status: item.status })) });
                    setSelectedMode("update");
                  } else {
                    setAlkesData([]);
                    setInputData({ alkesitem: [{ idstock: "", categorystock: "", subcategorystock: "", sku: "", itemname: "", unit: "", qty: "", status: "" }] });
                    setSelectedMode("add");
                  }
                  break;
                case "5":
                  addtFormData.append("data", JSON.stringify({ secret, idmedics: params }));
                  data = await apiRead(addtFormData, "office", "viewlab");
                  if (data && data.data && data.data.length > 0) {
                    selecteddata = data.data[0];
                    setSelectedData(selecteddata.idlab);
                    setLabData(data.data);
                    setInputData({ name: selecteddata.labname, address: selecteddata.labaddress, price: selecteddata.labprice });
                    setSelectedMode("update");
                  } else {
                    setSelectedData(null);
                    setLabData([]);
                    setInputData({ name: "", address: "", price: "" });
                    setSelectedMode("add");
                  }
                  break;
                default:
                  break;
              }
              break;
            case "3":
              formData.append("data", JSON.stringify({ secret, iduser: params }));
              data = await apiRead(formData, "office", "viewrecipe");
              if (data && data.data && data.data.length > 0) {
                selecteddata = data.data[0];
                setSelectedData(selecteddata.idrecipe);
                setRecipeData(data.data);
                setInputData({ recipe: selecteddata.recipe });
                setSelectedMode("update");
              } else {
                setSelectedData(null);
                setRecipeData([]);
                setInputData({ recipe: "" });
                setSelectedMode("add");
              }
              break;
            default:
              break;
          }
          break;
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
      const servicedata = await apiRead(formData, "office", "searchservice");
      if (servicedata && servicedata.data && servicedata.data.length > 0) {
        setAllservicedata(servicedata.data);
      } else {
        setAllservicedata([]);
      }
      const catstockdata = await apiRead(formData, "office", "searchcategorystock");
      if (catstockdata && catstockdata.data && catstockdata.data.length > 0) {
        setCategoryStockData(catstockdata.data);
      } else {
        setCategoryStockData([]);
      }
      const fvadata = await apiRead(formData, "office", "viewlistva");
      const allfvadata = fvadata.data;
      const staticdata = [{ code: "INVOICE", country: "ID", currency: "IDR", is_activated: true, name: "Invoice Xendit" }];
      const mergedvadata = [...staticdata, ...allfvadata];
      const filteredfvadata = mergedvadata.filter((va) => va.is_activated === true);
      if (filteredfvadata && filteredfvadata.length > 0) {
        setFvaListData(filteredfvadata);
      } else {
        setFvaListData([]);
      }
      addtFormData.append("data", JSON.stringify({ secret, kodeoutlet: cctr }));
      const dentistdata = await apiRead(addtFormData, "office", "viewdentistoutlet");
      if (dentistdata && dentistdata.data && dentistdata.data.length > 0) {
        setBranchDentistData(dentistdata.data);
      } else {
        setBranchDentistData([]);
      }
      const branchdata = await apiRead(formData, "office", "viewoutletall");
      if (branchdata && branchdata.data && branchdata.data.length > 0) {
        setAllBranchData(branchdata.data);
      } else {
        setAllBranchData([]);
      }
      const stockdata = await apiRead(formData, "office", "searchstock");
      if (stockdata && stockdata.data && stockdata.data.length > 0) {
        setAllStockData(stockdata.data);
      } else {
        setAllStockData([]);
      }
      addtFormData.append("data", JSON.stringify({ secret, idmedics: params }));
      const rscodedata = await apiRead(addtFormData, "office", "searchrscode");
      if (rscodedata && rscodedata.data && rscodedata.data.length > 0) {
        setRscodeData(rscodedata.data);
      } else {
        setRscodeData([]);
      }
      const diagdata = await apiRead(formData, "office", "viewdiagnosis");
      if (diagdata && diagdata.data && diagdata.data.length > 0) {
        setAllDiagnoseData(diagdata.data);
      } else {
        setAllDiagnoseData([]);
      }
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
        switch (tabId) {
          case "1":
            switch (subTabId) {
              case "1":
                requiredFields = ["histori_illness", "main_complaint", "additional_complaint", "current_illness", "gravida"];
                break;
              case "2":
                requiredFields = ["occlusi", "palatinus", "mandibularis", "palatum", "diastema", "anomali"];
                break;
              case "3":
                requiredFields = ["desc", "nadi", "tensi", "suhu", "berat_badan", "tinggi_badan", "pernapasan", "mata", "mulut_gigi", "kulit"];
                break;
              case "4":
                requiredFields = [];
                break;
              default:
                break;
            }
            break;
          case "2":
            switch (subTabId) {
              case "1":
                requiredFields = ["dmf_d", "dmf_m", "dmf_f", "def_d", "def_e", "def_f"];
                break;
              case "2":
                requiredFields = ["diagnose", "diagnosecode", "diagnosedetail"];
                break;
              case "3":
                if (selectedMode === "update") {
                  if (inputData.typepayment === "cashless" || inputData.typepayment === "insurance") {
                    requiredFields = ["name", "phone", "dentist", "bank_code", "order.service", "order.servicetype", "order.price"];
                  } else {
                    requiredFields = ["name", "phone", "dentist", "order.service", "order.servicetype", "order.price"];
                  }
                } else {
                  requiredFields = ["rscode"];
                }
                break;
              case "4":
                requiredFields = ["alkesitem.categorystock", "alkesitem.subcategorystock", "alkesitem.itemname", "alkesitem.unit", "alkesitem.qty", "alkesitem.status"];
                break;
              case "5":
                requiredFields = ["name", "price", "address"];
                break;
              default:
                break;
            }
            break;
          case "3":
            requiredFields = ["recipe"];
            break;
          default:
            break;
        }
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
          switch (tabId) {
            case "1":
              switch (subTabId) {
                case "1":
                  submittedData = { secret, idmedics: params, histori_illness: inputData.histori_illness, main_complaint: inputData.main_complaint, additional_complaint: inputData.additional_complaint, current_illness: inputData.current_illness, gravida: inputData.gravida, alergi_gatal: inputData.alergi_gatal, alergi_debu: inputData.alergi_debu, alergi_obat: inputData.alergi_obat, alergi_makanan: inputData.alergi_makanan, alergi_lainnya: inputData.alergi_lainnya };
                  break;
                case "2":
                  submittedData = { secret, idmedics: params, occlusi: inputData.occlusi, palatinus: inputData.palatinus, mandibularis: inputData.mandibularis, palatum: inputData.palatum, diastema: inputData.diastema, anomali: inputData.anomali, other: inputData.other_odontogram };
                  break;
                case "3":
                  submittedData = { secret, idmedics: params, desciption: inputData.desc, pulse: inputData.nadi, tension: inputData.tensi, temperature: inputData.suhu, weight: inputData.berat_badan, height: inputData.tinggi_badan, breath: inputData.pernapasan, eye: inputData.mata, mouth: inputData.mulut_gigi, skin: inputData.kulit };
                  break;
                case "4":
                  submittedData = { secret, idmedics: params };
                  break;
                default:
                  break;
              }
              break;
            case "2":
              switch (subTabId) {
                case "1":
                  submittedData = { secret, idmedics: params, D: inputData.dmf_d, M: inputData.dmf_m, F: inputData.dmf_f, dmfskor: dmfT, De: inputData.def_d, E: inputData.def_e, eF: inputData.def_f, defskor: defT, gigi: odontoHistoryData.filter((allitem) => allitem["tooth"].idconditiontooth === "").map((item) => ({ nomergigi: item["tooth"].tooth, kondisi: item["detailgigi"].map((subitem) => ({ singkatan: subitem.singkatan, arti: subitem.arti, keterangan: subitem.keterangan })) })) };
                  break;
                case "2":
                  submittedData = { secret, type: inputData.diagnose, code: inputData.diagnosecode, detail: inputData.diagnosedetail, idmedics: params, note: inputData.note };
                  break;
                case "3":
                  if (selectedMode === "update") {
                    submittedData = { secret, name: inputData.name, phone: inputData.phone, bank_code: inputData.bank_code, dentist: inputData.dentist, transactionstatus: inputData.status, layanan: inputData.order };
                  } else {
                    submittedData = { secret, idmedics: params, idreservation: inputData.rscode };
                  }
                  break;
                case "4":
                  submittedData = { secret, idmedics: params, stock: inputData.alkesitem };
                  break;
                case "5":
                  submittedData = { secret, idmedics: params, name: inputData.name, price: inputData.price, address: inputData.address };
                  break;
                default:
                  break;
              }
              break;
            case "3":
              submittedData = { secret, idmedics: params, recipe: inputData.recipe };
              break;
            default:
              break;
          }
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
      case "ORDER CUSTOMER":
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
                    <TH isSorted onSort={() => handleSort(orderDetailData, setOrderDetailData, "transactiondetailcreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderDetailData, setOrderDetailData, "service", "text")}>
                      Layanan
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderDetailData, setOrderDetailData, "servicetype", "text")}>
                      Jenis Layanan
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderDetailData, setOrderDetailData, "price", "number")}>
                      Harga
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {orderDetailData.map((data, index) => (
                    <TR key={index} isWarning={data.transactionstatus === "0"}>
                      <TD>{newDate(data.transactiondetailcreate, "id")}</TD>
                      <TD>{toTitleCase(data.service)}</TD>
                      <TD>{toTitleCase(data.servicetype)}</TD>
                      <TD>{newPrice(data.price)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
          </Fragment>
        );
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
      case "STOCK":
        return (
          <Fragment>
            <DashboardHead title={isFetching ? "Memuat data ..." : pageTitle} desc={isFetching ? "Memuat detail ..." : isDataShown ? `Menampilkan histori stok ${newDate(formatDate(startDate), "id")} hingga ${newDate(formatDate(endDate), "id")}.` : `Histori stok ${newDate(formatDate(startDate), "id")} hingga ${newDate(formatDate(endDate), "id")} tidak ditemukan.`} />
            <DashboardToolbar>
              <Button id={`${pageid}-back-previous-page`} buttonText="Kembali" radius="md" onClick={goBack} startContent={<Arrow direction="left" />} />
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="md" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isDataShown} />
                <Button id={`filter-data-${pageid}`} radius="md" buttonText="Filter" onClick={openForm} startContent={<Filter />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber page={currentPage} limit={limit} isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(stockHistoryData, setStockHistoryData, "logstockcreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockHistoryData, setStockHistoryData, "status", "number")}>
                      Status
                    </TH>
                    {/* <Fragment>{level === "admin" && <TH>Harga Satuan</TH>}</Fragment> */}
                    <TH isSorted onSort={() => handleSort(stockHistoryData, setStockHistoryData, "qty", "number")}>
                      Jumlah
                    </TH>
                    {/* <Fragment>{level === "admin" && <TH>Total Harga</TH>}</Fragment> */}
                    <TH isSorted onSort={() => handleSort(stockHistoryData, setStockHistoryData, "outletname", "text")}>
                      Cabang
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filterData().map((data, index) => (
                    <TR key={index}>
                      <TD>{newDate(data.logstockcreate, "id")}</TD>
                      <TD>{data.status}</TD>
                      {/* <Fragment>{level === "admin" && <TD>{newPrice(data.value)}</TD>}</Fragment> */}
                      <TD type="number">{data.qty}</TD>
                      {/* <Fragment>{level === "admin" && <TD>{newPrice(data.totalvalue)}</TD>}</Fragment> */}
                      <TD>{toTitleCase(data.outletname)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="sm" formTitle="Terapkan Filter" operation="event" onClose={closeForm} cancelText="Tutup">
                {level === "admin" && <Input id={`${pageid}-outlet`} labelText="Nama Cabang" variant="select" isSearchable radius="md" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onSelect={handleBranchChange} />}
                <Fieldset>
                  <Input id={`${pageid}-filter-startdate`} radius="md" labelText="Filter dari:" type="datetime-local" value={formatDate(startDate)} onChange={(e) => setStartDate(new Date(e.target.value))} />
                  <Input id={`${pageid}-filter-enddate`} radius="md" labelText="Hingga:" type="datetime-local" value={formatDate(endDate)} onChange={(e) => setEndDate(new Date(e.target.value))} />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "REKAM MEDIS":
        const subTabButton = (id) => {
          if (id === "1") {
            return subTab1Button;
          } else if (id === "2") {
            return subTab2Button;
          } else {
            return [];
          }
        };

        const handleSubTabChange = (id) => setSubTabId(id);
        const handleTabChange = (id) => {
          setTabId(id);
          setSubTabId("1");
          subTabButton(id);
        };

        const tabbutton = [
          { label: "Catatan Klinik", onClick: () => handleTabChange("1"), active: tabId === "1" },
          { label: "Diagnosa & Tindakan", onClick: () => handleTabChange("2"), active: tabId === "2" },
          { label: "Resep", onClick: () => handleTabChange("3"), active: tabId === "3" },
        ];
        const subTab1Button = [
          { label: "Anamesa", onClick: () => handleSubTabChange("1"), active: subTabId === "1" },
          { label: "Anamesa Odontogram", onClick: () => handleSubTabChange("2"), active: subTabId === "2" },
          { label: "Pemeriksaan Umum", onClick: () => handleSubTabChange("3"), active: subTabId === "3" },
          { label: "Foto Pasien", onClick: () => handleSubTabChange("4"), active: subTabId === "4" },
        ];
        const subTab2Button = [
          { label: "Kondisi", onClick: () => handleSubTabChange("1"), active: subTabId === "1" },
          { label: "Diagnosa", onClick: () => handleSubTabChange("2"), active: subTabId === "2" },
          { label: "Tindakan Medis", onClick: () => handleSubTabChange("3"), active: subTabId === "3" },
          { label: "Pemakaian Alkes", onClick: () => handleSubTabChange("4"), active: subTabId === "4" },
          { label: "Lab", onClick: () => handleSubTabChange("5"), active: subTabId === "5" },
        ];

        const renderSection = () => {
          switch (tabId) {
            case "1":
              switch (subTabId) {
                case "1":
                  return (
                    <OnpageForm loading={isFetching} onSubmit={(e) => handleSubmit(e, "cudanamnesa")}>
                      <Fieldset>
                        <Input id={`${pageid}-history-illines`} radius="md" labelText="Riwayat Penyakit" placeholder="Tulis riwayat penyakit" type="text" name="histori_illness" value={inputData.histori_illness} onChange={handleInputChange} errorContent={errors.histori_illness} isRequired />
                        <Input id={`${pageid}-current-illines`} radius="md" labelText="Penyakit Saat Ini" placeholder="Tulis penyakit saat ini" type="text" name="current_illness" value={inputData.current_illness} onChange={handleInputChange} errorContent={errors.current_illness} isRequired />
                        <Input id={`${pageid}-gravida`} radius="md" labelText="Gravida" placeholder="Tulis gravida" type="text" name="gravida" value={inputData.gravida} onChange={handleInputChange} errorContent={errors.gravida} isRequired />
                      </Fieldset>
                      <Fieldset>
                        <Input id={`${pageid}-complaint`} variant="textarea" rows={4} labelText="Keluhan Utama" placeholder="Tulis keluhan utama" name="main_complaint" value={inputData.main_complaint} onChange={handleInputChange} errorContent={errors.main_complaint} isRequired />
                        <Input id={`${pageid}-addt-complaint`} variant="textarea" rows={4} labelText="Keluhan Tambahan" placeholder="Tulis keluhan tambahan" name="additional_complaint" value={inputData.additional_complaint} onChange={handleInputChange} errorContent={errors.additional_complaint} isRequired />
                      </Fieldset>
                      <Fieldset>
                        <Input id={`${pageid}-allergi-gatal`} variant="textarea" rows={3} labelText="Alergi Gatal" placeholder="Masukkan catatan alergi" name="alergi_gatal" value={inputData.alergi_gatal ? JSON.parse(inputData.alergi_gatal).note : ""} onChange={(e) => setInputData((prevState) => ({ ...prevState, alergi_gatal: JSON.stringify({ alergi: "gatal", note: e.target.value }) }))} />
                        <Input id={`${pageid}-allergi-debu`} variant="textarea" rows={3} labelText="Alergi Debu" placeholder="Masukkan catatan alergi" name="alergi_debu" value={inputData.alergi_debu ? JSON.parse(inputData.alergi_debu).note : ""} onChange={(e) => setInputData((prevState) => ({ ...prevState, alergi_debu: JSON.stringify({ alergi: "debu", note: e.target.value }) }))} />
                      </Fieldset>
                      <Fieldset>
                        <Input id={`${pageid}-allergi-obat`} variant="textarea" rows={3} labelText="Alergi Obat" placeholder="Masukkan catatan alergi" name="alergi_obat" value={inputData.alergi_obat ? JSON.parse(inputData.alergi_obat).note : ""} onChange={(e) => setInputData((prevState) => ({ ...prevState, alergi_obat: JSON.stringify({ alergi: "obat", note: e.target.value }) }))} />
                        <Input id={`${pageid}-allergi-makanan`} variant="textarea" rows={3} labelText="Alergi Makanan" placeholder="Masukkan catatan alergi" name="alergi_makanan" value={inputData.alergi_makanan ? JSON.parse(inputData.alergi_makanan).note : ""} onChange={(e) => setInputData((prevState) => ({ ...prevState, alergi_makanan: JSON.stringify({ alergi: "makanan", note: e.target.value }) }))} />
                      </Fieldset>
                      <Input id={`${pageid}-allergi-lainnya`} variant="textarea" rows={3} labelText="Alergi Lainnya" placeholder="Masukkan catatan alergi" name="alergi_lainnya" value={inputData.alergi_lainnya ? JSON.parse(inputData.alergi_lainnya).note : ""} onChange={(e) => setInputData((prevState) => ({ ...prevState, alergi_lainnya: JSON.stringify({ alergi: "lainnya", note: e.target.value }) }))} />
                      <FormFooter>
                        <Button id={`add-new-data-${pageid}`} type="submit" action={selectedMode} radius="md" buttonText={anamesaData.length > 0 ? "Simpan Perubahan" : "Simpan Baru"} isLoading={isSubmitting} startContent={<Check />} loadingContent={<LoadingContent />} />
                      </FormFooter>
                    </OnpageForm>
                  );
                case "2":
                  return (
                    <OnpageForm onSubmit={(e) => handleSubmit(e, "cudodontogram")}>
                      <Fieldset>
                        <Input id={`${pageid}-occlusi`} radius="md" labelText="Occlusi" placeholder="Masukkan occlusi" type="text" name="occlusi" value={inputData.occlusi} onChange={handleInputChange} errorContent={errors.occlusi} isRequired />
                        <Input id={`${pageid}-palatinus`} radius="md" labelText="Torus Platinus" placeholder="Masukkan torus platinus" type="text" name="palatinus" value={inputData.palatinus} onChange={handleInputChange} errorContent={errors.palatinus} isRequired />
                        <Input id={`${pageid}-mandibularis`} radius="md" labelText="Torus Mandibularis" placeholder="Masukkan torus mandibularis" type="text" name="mandibularis" value={inputData.mandibularis} onChange={handleInputChange} errorContent={errors.mandibularis} isRequired />
                      </Fieldset>
                      <Fieldset>
                        <Input id={`${pageid}-palatum`} radius="md" labelText="Palatum" placeholder="Masukkan palatum" type="text" name="palatum" value={inputData.palatum} onChange={handleInputChange} errorContent={errors.palatum} isRequired />
                        <Input id={`${pageid}-diastema`} radius="md" labelText="Diastema" placeholder="Nasukkan diastema" type="text" name="diastema" value={inputData.diastema} onChange={handleInputChange} errorContent={errors.diastema} isRequired />
                        <Input id={`${pageid}-anomali`} radius="md" labelText="Gigi Anomali" placeholder="Masukkan gigi anomali" type="text" name="anomali" value={inputData.anomali} onChange={handleInputChange} errorContent={errors.anomali} isRequired />
                      </Fieldset>
                      <Input id={`${pageid}-other`} radius="md" labelText="Lain-lain" placeholder="Masukkan odontogram lainnya" type="text" name="other_odontogram" value={inputData.other_odontogram} onChange={handleInputChange} />
                      <FormFooter>
                        <Button id={`add-new-data-${pageid}`} type="submit" action={selectedMode} radius="md" buttonText={odontogramData.length > 0 ? "Simpan Perubahan" : "Simpan Baru"} isLoading={isSubmitting} startContent={<Check />} loadingContent={<LoadingContent />} />
                      </FormFooter>
                    </OnpageForm>
                  );
                case "3":
                  return (
                    <OnpageForm onSubmit={(e) => handleSubmit(e, "cudinspection")}>
                      <Input id={`${pageid}-desc`} radius="md" labelText="Deskripsi Pemeriksaan" placeholder="Tulis deskripsi pemeriksaan" type="text" name="desc" value={inputData.desc} onChange={handleInputChange} errorContent={errors.desc} isRequired />
                      <Fieldset>
                        <Input id={`${pageid}-nadi`} radius="md" labelText="Nadi" placeholder="Tulis hasil pemeriksaan nadi" type="text" name="nadi" value={inputData.nadi} onChange={handleInputChange} errorContent={errors.nadi} isRequired />
                        <Input id={`${pageid}-tensi`} radius="md" labelText="Tensi Darah" placeholder="Tulis tensi darah" type="text" name="tensi" value={inputData.tensi} onChange={handleInputChange} errorContent={errors.tensi} isRequired />
                        <Input id={`${pageid}-suhu`} radius="md" labelText="Suhu Badan" placeholder="Tulis suhu badan" type="text" name="suhu" value={inputData.suhu} onChange={handleInputChange} errorContent={errors.suhu} isRequired />
                      </Fieldset>
                      <Fieldset>
                        <Input id={`${pageid}-berat_badan`} radius="md" labelText="Berat Badan (kg)" placeholder="Tulis berat badan" type="number" name="berat_badan" value={inputData.berat_badan} onChange={handleInputChange} errorContent={errors.berat_badan} isRequired />
                        <Input id={`${pageid}-tinggi_badan`} radius="md" labelText="Tinggi Badan (cm)" placeholder="Tulis tinggi badan" type="number" name="tinggi_badan" value={inputData.tinggi_badan} onChange={handleInputChange} errorContent={errors.tinggi_badan} isRequired />
                        <Input id={`${pageid}-pernapasan`} radius="md" labelText="Pernapasan" placeholder="Tulis hasil pemeriksaan pernapasan" type="text" name="pernapasan" value={inputData.pernapasan} onChange={handleInputChange} errorContent={errors.pernapasan} isRequired />
                      </Fieldset>
                      <Fieldset>
                        <Input id={`${pageid}-mata`} radius="md" labelText="Mata" placeholder="Tulis hasil pemeriksaan mata" type="text" name="mata" value={inputData.mata} onChange={handleInputChange} errorContent={errors.mata} isRequired />
                        <Input id={`${pageid}-mulut_gigi`} radius="md" labelText="Mulut & Gigi" placeholder="Tulis hasil pemeriksaan mulut & gigi" type="text" name="mulut_gigi" value={inputData.mulut_gigi} onChange={handleInputChange} errorContent={errors.mulut_gigi} isRequired />
                        <Input id={`${pageid}-kulit`} radius="md" labelText="Kulit" placeholder="Tulis hasil pemeriksaan kulit" type="text" name="kulit" value={inputData.kulit} onChange={handleInputChange} errorContent={errors.kulit} isRequired />
                      </Fieldset>
                      <FormFooter>
                        <Button id={`add-new-data-${pageid}`} type="submit" action={selectedMode} radius="md" buttonText={inspectData.length > 0 ? "Simpan Perubahan" : "Simpan Baru"} isLoading={isSubmitting} startContent={<Check />} loadingContent={<LoadingContent />} />
                      </FormFooter>
                    </OnpageForm>
                  );
                case "4":
                  return (
                    <Fragment>
                      <Grid>
                        {photoMedic.map((photo) => (
                          <GridItem key={photo.idmedicalrecords} type="img" label={photo.idmedicalrecords} src={photo.photo} />
                        ))}
                      </Grid>
                      {isFormOpen && (
                        <SubmitForm size="sm" formTitle="Tambah Foto Pasien" operation="add" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudphoto")} loading={isSubmitting} onClose={closeForm}>
                          <Input id={`${pageid}-medic-photo`} variant="upload" isPreview isLabeled={false} onSelect={handleImageSelect} />
                        </SubmitForm>
                      )}
                    </Fragment>
                  );
                default:
                  return <Table isNoData={true}></Table>;
              }
            case "2":
              switch (subTabId) {
                case "1":
                  const handleToothClick = (toothNumber) => {
                    if (selectedCondition) {
                      setOdontoHistoryData((prevResults) => {
                        const existingTooth = prevResults.find((tooth) => tooth["tooth"].tooth === toothNumber);
                        if (existingTooth) {
                          if (selectedMode === "update") {
                            showNotifications("danger", `Tidak dapat menambahkan data kondisi baru pada riwayat dengan nomor gigi yang sudah ada. Mohon hapus riwayat gigi no.${toothNumber} terlebih dahulu.`);
                            return prevResults;
                          } else {
                            const updatedResults = prevResults.map((tooth) => {
                              if (tooth["tooth"].tooth === toothNumber) {
                                return { ...tooth, detailgigi: [...tooth.detailgigi, { singkatan: selectedCondition.singkatan, arti: selectedCondition.arti, keterangan: selectedCondition.keterangan }] };
                              } else {
                                return tooth;
                              }
                            });
                            return updatedResults;
                          }
                        } else {
                          return [...prevResults, { tooth: { idconditiontooth: "", tooth: toothNumber }, detailgigi: [{ singkatan: selectedCondition.singkatan, arti: selectedCondition.arti, keterangan: selectedCondition.keterangan }] }];
                        }
                      });
                    } else {
                      showNotifications("danger", "Mohon pilih salah satu data kondisi terlebih dahulu.");
                    }
                  };

                  const handleDeleteHistory = async (label, iddetail, index) => {
                    const confirmmsg = `Apakah anda yakin untuk menghapus data riwayat Odontogram no.${label}?`;
                    const successmsg = `Selamat! Data riwayat Odontogram no.${label} berhasil dihapus.`;
                    const errormsg = "Terjadi kesalahan saat menghapus data. Mohon periksa koneksi internet anda dan coba lagi.";
                    const confirm = window.confirm(confirmmsg);
                    if (!confirm) {
                      return;
                    }
                    setIsDeleting(true);
                    try {
                      if (iddetail === "") {
                        setOdontoHistoryData((prevResults) => prevResults.filter((_, idx) => idx !== index));
                      } else {
                        const formData = new FormData();
                        const submittedData = { secret, idmedics: params, D: inputData.dmf_d, M: inputData.dmf_m, F: inputData.dmf_f, dmfskor: dmfT, De: inputData.def_d, E: inputData.def_e, eF: inputData.def_f, defskor: defT, gigi: odontoHistoryData.filter((allitem) => allitem["tooth"].idconditiontooth === "").map((item) => ({ nomergigi: item["tooth"].tooth, kondisi: item["detailgigi"].map((subitem) => ({ singkatan: subitem.singkatan, arti: subitem.arti, keterangan: subitem.keterangan })) })) };
                        formData.append("data", JSON.stringify(submittedData));
                        formData.append("iddelete", iddetail);
                        await apiCrud(formData, "office", "addtooth");
                        setOdontoHistoryData((prevResults) => prevResults.filter((_, idx) => idx !== index));
                        await fetchData();
                      }
                      showNotifications("success", successmsg);
                    } catch (error) {
                      showNotifications("danger", errormsg);
                      console.error(errormsg, error);
                    } finally {
                      setIsDeleting(false);
                    }
                  };

                  const openToothForm = async (params) => {
                    const formData = new FormData();
                    formData.append("data", JSON.stringify({ secret, idtooth: params.idconditiontooth }));
                    setSelectedToothNo(params);
                    setIsFormOpen(true);
                    setIsFormFetching(true);
                    try {
                      const data = await apiRead(formData, "office", "viewtoothdesc");
                      if (data && data.data && data.data.length > 0) {
                        setInputData({ ...inputData, desc: data.data[0].description });
                      } else {
                        setInputData({ ...inputData, desc: "" });
                      }
                    } catch (error) {
                      showNotifications("danger", "Terjadi kesalahan saat memuat data deskripsi. Mohon periksa koneksi internet anda dan coba lagi.");
                      console.error("Terjadi kesalahan saat memuat data deskripsi. Mohon periksa koneksi internet anda dan coba lagi.", error);
                    } finally {
                      setIsFormFetching(false);
                    }
                  };

                  const closeToothForm = () => {
                    setSelectedToothNo(null);
                    setIsFormOpen(false);
                    setInputData({ ...inputData, desc: "" });
                    setErrors({ ...errors, desc: "" });
                  };

                  const handleSubmitToothDesc = async (e) => {
                    e.preventDefault();
                    const validationErrors = inputValidator(inputData, ["desc"]);
                    if (Object.keys(validationErrors).length > 0) {
                      setErrors(validationErrors);
                      return;
                    }
                    const confirmmsg = `Apakah anda yakin untuk menyimpan perubahan pada deskripsi pada riwayat gigi no.${selectedToothNo.tooth}?`;
                    const successmsg = `Selamat! Perubahan deskripsi pada riwayat gigi no.${selectedToothNo.tooth} berhasil disimpan.`;
                    const errormsg = "Terjadi kesalahan saat menyimpan perubahan. Mohon periksa koneksi internet anda dan coba lagi.";
                    const confirm = window.confirm(confirmmsg);
                    if (!confirm) {
                      return;
                    }
                    setIsSubmitting(true);
                    try {
                      const formData = new FormData();
                      formData.append("data", JSON.stringify({ secret, desc: inputData.desc }));
                      formData.append("idedit", selectedToothNo.idconditiontooth);
                      await apiCrud(formData, "office", "updatetoothdesc");
                      showNotifications("success", successmsg);
                      await fetchData();
                      closeToothForm();
                    } catch (error) {
                      showNotifications("danger", errormsg);
                      console.error(errormsg, error);
                    } finally {
                      setIsSubmitting(false);
                    }
                  };

                  return (
                    <Fragment>
                      <OdontoForm onSubmit={(e) => handleSubmit(e, "addtooth")} submitting={isSubmitting} deleting={isDeleting}>
                        <OdontoHistory onDeleteAll={() => {}}>
                          {odontoHistoryData.map((item, index) => (
                            <HistoryTr key={index} no={item["tooth"].tooth} label={item["detailgigi"]} isEditable={item["tooth"].idconditiontooth !== ""} onEdit={() => openToothForm(item["tooth"])} onDelete={() => handleDeleteHistory(item["tooth"].tooth, item["tooth"].idconditiontooth, index)} />
                          ))}
                        </OdontoHistory>
                        <OdontoGram inputData={inputData} setInputData={setInputData} dmfT={dmfT} defT={defT} action={selectedMode}>
                          <GramSet type="top">
                            <GramRows>
                              {topleft.map((item, index) => (
                                <GramBlock key={index} topLabel={item.no} type={item.type} onClick={() => handleToothClick(item.no)} />
                              ))}
                            </GramRows>
                            <GramMarker alt="top" src="/svg/down-marker.svg" />
                            <GramRows>
                              {topright.map((item, index) => (
                                <GramBlock key={index} topLabel={item.no} type={item.type} onClick={() => handleToothClick(item.no)} />
                              ))}
                            </GramRows>
                          </GramSet>
                          <GramSet type="center">
                            <GramSet type="center-child">
                              <GramRows>
                                {centertopleft.map((item, index) => (
                                  <GramBlock key={index} topLabel={item.no} type={item.type} onClick={() => handleToothClick(item.no)} />
                                ))}
                              </GramRows>
                              <GramRows>
                                {centertopright.map((item, index) => (
                                  <GramBlock key={index} topLabel={item.no} type={item.type} onClick={() => handleToothClick(item.no)} />
                                ))}
                              </GramRows>
                            </GramSet>
                            <GramMarker alt="center-top" src="/svg/up-marker.svg" />
                            <GramMarker alt="center-bot" src="/svg/down-marker.svg" />
                            <GramSet type="center-child">
                              <GramRows>
                                {centerbotleft.map((item, index) => (
                                  <GramBlock key={index} botLabel={item.no} type={item.type} onClick={() => handleToothClick(item.no)} />
                                ))}
                              </GramRows>
                              <GramRows>
                                {centerbotright.map((item, index) => (
                                  <GramBlock key={index} botLabel={item.no} type={item.type} onClick={() => handleToothClick(item.no)} />
                                ))}
                              </GramRows>
                            </GramSet>
                          </GramSet>
                          <GramSet type="bot">
                            <GramRows>
                              {botleft.map((item, index) => (
                                <GramBlock key={index} botLabel={item.no} type={item.type} onClick={() => handleToothClick(item.no)} />
                              ))}
                            </GramRows>
                            <GramMarker alt="bot" src="/svg/up-marker.svg" />
                            <GramRows>
                              {botright.map((item, index) => (
                                <GramBlock key={index} botLabel={item.no} type={item.type} onClick={() => handleToothClick(item.no)} />
                              ))}
                            </GramRows>
                          </GramSet>
                        </OdontoGram>
                        <OdontoCondition>
                          {conditionData.map((item, index) => (
                            <ConditionLi key={index} label={item.singkatan} name={item.arti} onClick={() => setSelectedCondition(item)} isActive={selectedCondition && selectedCondition.idtooth === item.idtooth} />
                          ))}
                        </OdontoCondition>
                      </OdontoForm>
                      {isFormOpen && selectedToothNo && (
                        <SubmitForm size="sm" formTitle={`Perbarui Deskripsi no.${selectedToothNo.idconditiontooth}`} fetching={isFormFetching} onSubmit={handleSubmitToothDesc} loading={isSubmitting} onClose={closeToothForm}>
                          <Input id={`${pageid}-note`} variant="textarea" labelText="Deskripsi" placeholder="Masukkan deskripsi" name="desc" rows={5} value={inputData.desc} onChange={handleInputChange} errorContent={errors.desc} isRequired />
                        </SubmitForm>
                      )}
                    </Fragment>
                  );
                case "2":
                  return (
                    <OnpageForm loading={isFetching} onSubmit={(e) => handleSubmit(e, "adddiagnosisuser")}>
                      <Fieldset>
                        <Input id={`${pageid}-diagnose`} variant="select" noEmptyValue radius="md" labelText="Jenis Diagnosa" placeholder="Pilih jenis diagnosa" name="diagnose" value={inputData.diagnose} options={diagnoseopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "diagnose", value: selectedValue } })} errorContent={errors.diagnose} isRequired />
                        <Input
                          id={`${pageid}-diagnose-code`}
                          variant="select"
                          isSearchable
                          radius="md"
                          labelText="Kode Diagnosa"
                          placeholder="Pilih kode diagnosa"
                          name="diagnosecode"
                          value={inputData.diagnosecode}
                          options={allDiagnoseData.map((diag) => ({ value: diag["code"].diagnosiscode, label: diag["code"].diagnosiscode }))}
                          onSelect={(selectedValue) => handleInputChange({ target: { name: "diagnosecode", value: selectedValue } })}
                          errorContent={errors.diagnosecode}
                          isRequired
                          isDisabled={!inputData.diagnose}
                        />
                      </Fieldset>
                      <Fieldset>
                        <Input
                          id={`${pageid}-diagnose-detail`}
                          variant="select"
                          isSearchable
                          radius="md"
                          labelText="Rincian Diagnosa"
                          placeholder={inputData.diagnosecode ? "Pilih rincian diagnosa" : "Mohon pilih kode diagnosa dahulu"}
                          name="diagnosedetail"
                          value={inputData.diagnosedetail}
                          options={(inputData.diagnosecode && allDiagnoseData.find((s) => s["code"].diagnosiscode === inputData.diagnosecode)?.["detail"].map((det) => ({ value: det.diagnosisdetail, label: det.diagnosisdetail }))) || []}
                          onSelect={(selectedValue) => handleInputChange({ target: { name: "diagnosedetail", value: selectedValue } })}
                          errorContent={errors.diagnosedetail}
                          isRequired
                          isDisabled={!inputData.diagnosecode}
                        />
                        <Input id={`${pageid}-note`} variant="textarea" labelText="Keterangan" placeholder="Masukkan keterangan diagnosa" name="note" rows={5} value={inputData.note} onChange={handleInputChange} errorContent={errors.note} />
                      </Fieldset>
                      <FormFooter>
                        <Button id={`add-new-data-${pageid}`} type="submit" action={selectedMode} radius="md" buttonText={rkmDiagnosaData.length > 0 ? "Simpan Perubahan" : "Simpan Baru"} isLoading={isSubmitting} startContent={<Check />} loadingContent={<LoadingContent />} />
                      </FormFooter>
                    </OnpageForm>
                  );
                case "3":
                  return (
                    <Fragment>
                      {historyOrderData.length > 0 ? (
                        <OnpageForm loading={isFetching} onSubmit={(e) => handleSubmit(e, "cudorder")}>
                          <Fieldset>
                            <Input id={`${pageid}-name`} radius="md" labelText="Nama Pelanggan" placeholder="e.g. John Doe" type="text" name="name" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired />
                            <Input id={`${pageid}-phone`} radius="md" labelText="Nomor Telepon" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errorContent={errors.phone} isRequired />
                            <Input id={`${pageid}-dentist`} variant="select" isSearchable radius="md" labelText="Dokter" placeholder="Pilih Dokter" name="dentist" value={inputData.dentist} options={branchDentistData.map((dentist) => ({ value: dentist.name_dentist, label: dentist.name_dentist.replace(`${dentist.id_branch} -`, "") }))} onSelect={(selectedValue) => handleInputChange({ target: { name: "dentist", value: selectedValue } })} errorContent={errors.dentist} isRequired />
                          </Fieldset>
                          <Fieldset>
                            <Input id={`${pageid}-type-payments`} variant="select" noEmptyValue radius="md" labelText="Tipe Pembayaran" placeholder="Pilih tipe pembayaran" name="typepayment" value={inputData.typepayment} options={paymenttypeopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "typepayment", value: selectedValue } })} errorContent={errors.typepayment} isRequired />
                            {inputData.typepayment && (
                              <Fragment>
                                {inputData.typepayment === "cashless" ? (
                                  <Input
                                    id={`${pageid}-method-payments`}
                                    variant="select"
                                    isSearchable
                                    radius="md"
                                    labelText="Metode Pembayaran"
                                    placeholder={inputData.typepayment ? "Pilih metode pembayaran" : "Mohon pilih tipe dahulu"}
                                    name="bank_code"
                                    value={inputData.bank_code}
                                    options={fvaListData.map((va) => ({ value: va.code, label: va.name }))}
                                    onSelect={(selectedValue) => handleInputChange({ target: { name: "bank_code", value: selectedValue } })}
                                    errorContent={errors.bank_code}
                                    isDisabled={!inputData.typepayment}
                                    isRequired
                                  />
                                ) : (
                                  <Fragment>
                                    {inputData.typepayment === "insurance" && <Input id={`${pageid}-insurance`} radius="md" labelText="Nama Asuransi" placeholder="Masukkan nama asuransi" type="text" name="bank_code" value={inputData.bank_code} onChange={handleInputChange} errorContent={errors.bank_code} isRequired />}
                                    <Input id={`${pageid}-status-payments`} variant="select" noEmptyValue radius="md" labelText="Status Pembayaran" placeholder={inputData.typepayment ? "Set status pembayaran" : "Mohon pilih tipe dahulu"} name="status" value={inputData.status} options={orderstatopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} errorContent={errors.status} isDisabled={!inputData.typepayment} />
                                  </Fragment>
                                )}
                              </Fragment>
                            )}
                          </Fieldset>
                          {inputData.order &&
                            inputData.order.length > 0 &&
                            inputData.order.map((subservice, index) => (
                              <Fieldset
                                key={index}
                                type="row"
                                markers={`${index + 1}.`}
                                endContent={
                                  <Fragment>
                                    <Button id={`${pageid}-delete-row-${index}`} subVariant="icon" isTooltip tooltipText="Hapus" size="sm" color={inputData.order.length <= 1 ? "var(--color-red-30)" : "var(--color-red)"} bgColor="var(--color-red-10)" iconContent={<NewTrash />} onClick={() => handleRmvRow("order", index)} isDisabled={inputData.order.length <= 1} />
                                    {index + 1 === inputData.order.length && <Button id={`${pageid}-add-row`} subVariant="icon" isTooltip tooltipText="Tambah" size="sm" color="var(--color-primary)" bgColor="var(--color-primary-10)" iconContent={<Plus />} onClick={() => handleAddRow("order")} />}
                                  </Fragment>
                                }>
                                <Input
                                  id={`${pageid}-name-${index}`}
                                  variant="select"
                                  isSearchable
                                  radius="md"
                                  labelText="Nama Layanan"
                                  placeholder="Pilih Layanan"
                                  name="service"
                                  value={subservice.service}
                                  options={allservicedata.map((service) => ({ value: service["Nama Layanan"].servicename, label: service["Nama Layanan"].servicename }))}
                                  onSelect={(selectedValue) => handleRowChange("order", index, { target: { name: "service", value: selectedValue } })}
                                  errorContent={errors[`order.${index}.service`] ? errors[`order.${index}.service`] : ""}
                                  isRequired
                                  isReadonly={inputData.order[index].service === "RESERVATION"}
                                />
                                <Input
                                  id={`${pageid}-type-name-${index}`}
                                  variant="select"
                                  isSearchable
                                  radius="md"
                                  labelText="Jenis Layanan"
                                  placeholder={subservice.service ? "Pilih jenis layanan" : "Mohon pilih layanan dahulu"}
                                  name="servicetype"
                                  value={subservice.servicetype}
                                  options={(inputData.order[index].service && allservicedata.find((s) => s["Nama Layanan"].servicename === inputData.order[index].service)?.["Jenis Layanan"].map((type) => ({ value: type.servicetypename, label: type.servicetypename }))) || []}
                                  onSelect={(selectedValue) => handleRowChange("order", index, { target: { name: "servicetype", value: selectedValue } })}
                                  errorContent={errors[`order.${index}.servicetype`] ? errors[`order.${index}.servicetype`] : ""}
                                  isRequired
                                  isDisabled={!inputData.order[index].service}
                                  isReadonly={inputData.order[index].service === "RESERVATION"}
                                />
                                <Input id={`${pageid}-type-price-${index}`} radius="md" labelText="Atur Harga" placeholder="Masukkan harga" type="number" name="price" value={subservice.price} onChange={(e) => handleRowChange("order", index, e)} errorContent={errors[`order.${index}.price`] ? errors[`order.${index}.price`] : ""} isRequired isReadonly={inputData.order[index].service === "RESERVATION"} />
                              </Fieldset>
                            ))}
                          <FormFooter>
                            <Button id={`add-new-data-${pageid}`} type="submit" action={selectedMode} radius="md" buttonText={historyOrderData.length > 0 ? "Simpan Perubahan" : "Simpan Baru"} isLoading={isSubmitting} startContent={<Check />} loadingContent={<LoadingContent />} />
                          </FormFooter>
                        </OnpageForm>
                      ) : (
                        <OnpageForm loading={isFetching} onSubmit={(e) => handleSubmit(e, "addmedis")}>
                          <Input id={`${pageid}-rscode`} variant="select" isSearchable radius="md" labelText="Kode Reservasi" placeholder="Pilih kode reservasi" name="rscode" value={inputData.rscode} options={rscodeData.map((rscode) => ({ value: rscode.idreservation, label: rscode.rscode })) || []} onSelect={(selectedValue) => handleInputChange({ target: { name: "rscode", value: selectedValue } })} errorContent={errors.rscode} isRequired />
                          <FormFooter>
                            <Button id={`add-new-data-${pageid}`} type="submit" action={selectedMode} radius="md" buttonText={historyOrderData.length > 0 ? "Simpan Perubahan" : "Simpan Baru"} isLoading={isSubmitting} startContent={<Check />} loadingContent={<LoadingContent />} />
                          </FormFooter>
                        </OnpageForm>
                      )}
                    </Fragment>
                  );
                case "4":
                  return (
                    <OnpageForm loading={isFetching} onSubmit={(e) => handleSubmit(e, "addstockout")}>
                      {inputData.alkesitem &&
                        inputData.alkesitem.length > 0 &&
                        inputData.alkesitem.map((alkes, index) => (
                          <Fieldset
                            key={index}
                            type="row"
                            markers={`${index + 1}.`}
                            endContent={
                              <Fragment>
                                <Button id={`${pageid}-delete-row-${index}`} subVariant="icon" isTooltip tooltipText="Hapus" size="sm" color={inputData.alkesitem.length <= 1 ? "var(--color-red-30)" : "var(--color-red)"} bgColor="var(--color-red-10)" iconContent={<NewTrash />} onClick={() => handleRmvRow("alkesitem", index)} isDisabled={inputData.alkesitem.length <= 1} />
                                {index + 1 === inputData.alkesitem.length && <Button id={`${pageid}-add-row`} subVariant="icon" isTooltip tooltipText="Tambah" size="sm" color="var(--color-primary)" bgColor="var(--color-primary-10)" iconContent={<Plus />} onClick={() => handleAddRow("alkesitem")} />}
                              </Fragment>
                            }>
                            <Input
                              id={`${pageid}-categorystock-${index}`}
                              variant="select"
                              isSearchable
                              radius="md"
                              labelText="Kategori"
                              placeholder="Pilih kategori"
                              name="categorystock"
                              value={alkes.categorystock}
                              options={categoryStockData.map((cat) => ({ value: cat["category_stok"].categorystockname, label: cat["category_stok"].categorystockname }))}
                              onSelect={(selectedValue) => handleRowChange("alkesitem", index, { target: { name: "categorystock", value: selectedValue } })}
                              errorContent={errors[`alkesitem.${index}.categorystock`] ? errors[`alkesitem.${index}.categorystock`] : ""}
                              isRequired
                            />
                            <Input
                              id={`${pageid}-subcategorystock-${index}`}
                              variant="select"
                              isSearchable
                              radius="md"
                              labelText="Sub Kategori"
                              placeholder={alkes.categorystock ? "Pilih sub kategori" : "Mohon pilih kategori dahulu"}
                              name="subcategorystock"
                              value={alkes.subcategorystock}
                              options={(alkes.categorystock && categoryStockData.find((cat) => cat["category_stok"].categorystockname === alkes.categorystock)?.["subcategory_stok"].map((sub) => ({ value: sub.subcategorystock, label: sub.subcategorystock }))) || []}
                              onSelect={(selectedValue) => handleRowChange("alkesitem", index, { target: { name: "subcategorystock", value: selectedValue } })}
                              errorContent={errors[`alkesitem.${index}.subcategorystock`] ? errors[`alkesitem.${index}.subcategorystock`] : ""}
                              isRequired
                              isDisabled={!alkes.categorystock}
                            />
                            <Input
                              id={`${pageid}-item-name-${index}`}
                              variant="select"
                              isSearchable
                              radius="md"
                              labelText="Nama Item"
                              placeholder="Pilih Item"
                              name="itemname"
                              value={alkes.itemname}
                              options={alkes.subcategorystock && allStockData.filter((sub) => sub.subcategorystock === alkes.subcategorystock).map((item) => ({ value: item.itemname, label: item.itemname }))}
                              onSelect={(selectedValue) => handleRowChange("alkesitem", index, { target: { name: "itemname", value: selectedValue } })}
                              errorContent={errors[`alkesitem.${index}.itemname`] ? errors[`alkesitem.${index}.itemname`] : ""}
                              isRequired
                              isDisabled={!alkes.subcategorystock}
                            />
                            <Input id={`${pageid}-item-unit-${index}`} radius="md" labelText="Unit Item" placeholder="PCS" type="text" name="unit" value={alkes.unit} onChange={(e) => handleRowChange("alkesitem", index, e)} errorContent={errors[`alkesitem.${index}.unit`] ? errors[`alkesitem.${index}.unit`] : ""} isRequired isDisabled={!alkes.itemname} />
                            <Input id={`${pageid}-item-qty-${index}`} radius="md" labelText="Jumlah Item" placeholder="50" type="number" name="qty" value={alkes.qty} onChange={(e) => handleRowChange("alkesitem", index, e)} errorContent={errors[`alkesitem.${index}.qty`] ? errors[`alkesitem.${index}.qty`] : ""} isRequired isDisabled={!alkes.itemname} />
                            <Input id={`${pageid}-item-status-${index}`} variant="select" radius="md" labelText="Status Item" placeholder="Pilih status" name="status" value={alkes.status} options={stockoutstatopt} onSelect={(selectedValue) => handleRowChange("alkesitem", index, { target: { name: "status", value: selectedValue } })} errorContent={errors[`alkesitem.${index}.status`] ? errors[`alkesitem.${index}.status`] : ""} isRequired isDisabled={!alkes.itemname} />
                          </Fieldset>
                        ))}
                      <FormFooter>
                        <Button id={`add-new-data-${pageid}`} type="submit" action={selectedMode} radius="md" buttonText={alkesData.length > 0 ? "Simpan Perubahan" : "Simpan Baru"} isLoading={isSubmitting} startContent={<Check />} loadingContent={<LoadingContent />} />
                      </FormFooter>
                    </OnpageForm>
                  );
                case "5":
                  return (
                    <OnpageForm loading={isFetching} onSubmit={(e) => handleSubmit(e, "addlab")}>
                      <Fieldset>
                        <Input id={`${pageid}-lab-name`} radius="md" labelText="Nama Lab" placeholder="Masukkan nama lab" type="text" name="name" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired />
                        <Input id={`${pageid}-lab-price`} radius="md" labelText="Harga" placeholder="Masukkan harga" type="number" name="price" value={inputData.price} onChange={handleInputChange} errorContent={errors.price} isRequired />
                      </Fieldset>
                      <Input id={`${pageid}-address`} variant="textarea" rows={4} labelText="Alamat Lab" placeholder="Masukkan alamat lab" name="address" value={inputData.address} onChange={handleInputChange} errorContent={errors.address} isRequired />
                      <FormFooter>
                        <Button id={`add-new-data-${pageid}`} type="submit" action={selectedMode} radius="md" buttonText={labData.length > 0 ? "Simpan Perubahan" : "Simpan Baru"} isLoading={isSubmitting} startContent={<Check />} loadingContent={<LoadingContent />} />
                      </FormFooter>
                    </OnpageForm>
                  );
                default:
                  return <Table isNoData={true}></Table>;
              }
            case "3":
              return (
                <OnpageForm loading={isFetching} onSubmit={(e) => handleSubmit(e, "addrecipe")}>
                  <Input id={`${pageid}-recipe`} variant="textarea" labelText="Resep" placeholder="Tulis resep" name="recipe" rows={5} value={inputData.recipe} onChange={handleInputChange} errorContent={errors.recipe} isRequired />
                  <FormFooter>
                    <Button id={`add-new-data-${pageid}`} type="submit" action={selectedMode} radius="md" buttonText={recipeData.length > 0 ? "Simpan Perubahan" : "Simpan Baru"} isLoading={isSubmitting} startContent={<Check />} loadingContent={<LoadingContent />} />
                  </FormFooter>
                </OnpageForm>
              );
            default:
              return <Table isNoData={true}></Table>;
          }
        };

        return (
          <Fragment>
            <DashboardHead title={`Rekam Medis #${params}`} desc="Panel untuk memperbarui profil data dan menambah histori catatan medis pasien." />
            <DashboardToolbar>
              <Button id={`${pageid}-back-previous-page`} buttonText="Kembali" radius="md" onClick={goBack} startContent={<Arrow direction="left" />} />
              {tabId === "1" && subTabId === "4" && <Button id={`add-new-data-${pageid}`} radius="md" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />}
            </DashboardToolbar>
            <TabSwitch buttons={tabbutton} />
            {tabId !== "3" && <TabGroup buttons={subTabButton(tabId)} />}
            <DashboardBody>{renderSection()}</DashboardBody>
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

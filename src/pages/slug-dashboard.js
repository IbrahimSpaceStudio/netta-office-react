import React, { Fragment, useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useContent, useFormat, useDevmode } from "@ibrahimstudio/react";
import { Input } from "@ibrahimstudio/input";
import { Button } from "@ibrahimstudio/button";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { useSearch } from "../libs/plugins/handler";
import { getNestedValue, inputValidator } from "../libs/plugins/controller";
import { inputSchema, errorSchema } from "../libs/sources/common";
import { useOptions, useAlias } from "../libs/plugins/helper";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import TabGroup from "../components/input-controls/tab-group";
import TabSwitch from "../components/input-controls/tab-switch";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";
import { SubmitForm } from "../components/input-controls/forms";
import Fieldset, { ToggleSwitch } from "../components/input-controls/inputs";
import { Search, Plus, NewTrash } from "../components/contents/icons";
import Pagination from "../components/navigations/pagination";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Jakarta");

const DashboardSlugPage = ({ parent, slug }) => {
  const navigate = useNavigate();
  const { newDate } = useFormat();
  const { log } = useDevmode();
  const { toTitleCase, toPathname } = useContent();
  const { isLoggedin, secret } = useAuth();
  const { apiRead, apiCrud } = useApi();
  const { showNotifications } = useNotifications();
  const { limitopt, levelopt, usrstatopt, marriedstatopt, jobtypeopt } = useOptions();
  const { typeAlias } = useAlias();

  const pageid = parent && slug ? `slug-${toPathname(parent)}-${toPathname(slug)}` : "slug-dashboard";
  const pagetitle = slug ? `${toTitleCase(slug)}` : "Slug Dashboard";

  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isFormFetching, setIsFormFetching] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedMode, setSelectedMode] = useState("add");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [timers, setTimers] = useState({});
  const [onPageTabId, setOnpageTabId] = useState("1");

  const [emplyData, setEmplyData] = useState([]);
  const [allEmplyData, setAllEmplyData] = useState([]);
  const [programData, setProgramData] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [selectedJobType, setSelectedJobType] = useState("");

  const [inputData, setInputData] = useState({ ...inputSchema });
  const [errors, setErrors] = useState({ ...errorSchema });

  const handlePageChange = (page) => setCurrentPage(page);

  const restoreInputState = () => {
    setInputData({ ...inputSchema });
    setErrors({ ...errorSchema });
  };

  const handleImageSelect = (file) => setSelectedImage(file);
  const handleLimitChange = (value) => {
    setLimit(value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({ ...prevState, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleRowChange = (field, index, e) => {
    const { name, value } = e.target;
    const updatedvalues = [...inputData[field]];
    const updatederrors = errors[field] ? [...errors[field]] : [];
    updatedvalues[index] = { ...updatedvalues[index], [name]: value };
    if (field === "program" && name === "date") {
      if (value < 1 || value > 31) {
        updatederrors[index].date = "Mohon masukkan tanggal di rentang 1 sampai 31" || "";
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

  const handleAddRow = (field) => {
    let newitems = {};
    if (field === "program") {
      newitems = { idsource: "", sourcename: "", progname: "", channel: "", target: "", bobot: "" };
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

  const openForm = () => {
    setSelectedMode("add");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    restoreInputState();
    setIsFormOpen(false);
  };

  const openEdit = (params) => {
    switchData(params);
    setSelectedMode("update");
    setIsFormOpen(true);
  };

  const closeEdit = () => {
    restoreInputState();
    setIsFormOpen(false);
  };

  const calculateRemainingTime = (starttime, endtime) => {
    const now = dayjs();
    const today = dayjs().format("YYYY-MM-DD");
    const start = dayjs.tz(`${today} ${starttime}`, "YYYY-MM-DD HH:mm:ss", "Asia/Jakarta");
    const end = dayjs.tz(`${today} ${endtime}`, "YYYY-MM-DD HH:mm:ss", "Asia/Jakarta");
    if (now.isBefore(start)) {
      const totalDuration = end.diff(start);
      return dayjs(totalDuration).utc().format("HH:mm:ss");
    }
    if (now.isAfter(end)) return "00:00:00";
    const diff = end.diff(now);
    return dayjs(diff).utc().format("HH:mm:ss");
  };

  const fetchData = async () => {
    const errormsg = `Terjadi kesalahan saat memuat halaman ${toTitleCase(slug)}. Mohon periksa koneksi internet anda dan coba lagi.`;
    const formData = new FormData();
    let data;
    setIsFetching(true);
    try {
      const offset = (currentPage - 1) * limit;
      formData.append("data", JSON.stringify({ secret, limit, hal: offset }));
      switch (slug) {
        case "PEGAWAI":
          data = await apiRead(formData, "kpi", "viewemployee");
          if (data && data.data && data.data.length > 0) {
            setEmplyData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setEmplyData([]);
            setTotalPages(0);
          }
          break;
        case "PROGRAM":
          data = await apiRead(formData, "kpi", "viewprogram");
          if (data && data.data && data.data.length > 0) {
            setProgramData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setProgramData([]);
            setTotalPages(0);
          }
          break;
        case "JOB":
          const addtFormData = new FormData();
          switch (onPageTabId) {
            case "1":
              data = await apiRead(formData, "kpi", "viewjob");
              break;
            case "2":
              addtFormData.append("data", JSON.stringify({ secret, status: "1" }));
              data = await apiRead(addtFormData, "kpi", "viewjobstatus");
              break;
            case "3":
              addtFormData.append("data", JSON.stringify({ secret, status: "2" }));
              data = await apiRead(addtFormData, "kpi", "viewjobstatus");
              break;
            default:
              break;
          }
          if (data && data.data && data.data.length > 0) {
            if (onPageTabId === "1") {
              const resultdata = data.data[0];
              const mergeddata = [...resultdata.bulanan, ...resultdata.harian, ...resultdata.mingguan];
              setJobData(mergeddata);
            } else {
              const resultdata = data.data;
              setJobData(resultdata);
            }
          } else {
            setJobData([]);
          }
          break;
        default:
          setTotalPages(0);
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
    formData.append("data", JSON.stringify({ secret }));
    setIsOptimizing(true);
    try {
      const emplydata = await apiRead(formData, "kpi", "searchemployee");
      if (emplydata && emplydata.data && emplydata.data.length > 0) {
        setAllEmplyData(emplydata.data);
      } else {
        setAllEmplyData([]);
      }
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const switchData = async (params) => {
    setSelectedData(params);
    const currentData = (arraydata, identifier) => {
      if (typeof identifier === "string") {
        return arraydata.find((item) => getNestedValue(item, identifier) === params);
      } else {
        return arraydata.find((item) => item[identifier] === params);
      }
    };
    const errormsg = `Terjadi kesalahan saat memuat data. Mohon periksa koneksi internet anda dan coba lagi.`;
    const formData = new FormData();
    let data;
    let switchedData;
    setIsFormFetching(true);
    try {
      switch (slug) {
        case "PEGAWAI":
          switchedData = currentData(emplyData, "idemployee");
          log(`id ${slug} data switched:`, switchedData.idemployee);
          setInputData({ name: switchedData.name, phone: switchedData.phone, email: switchedData.email, address: switchedData.address, position: switchedData.position, level: switchedData.akses, division: switchedData.division, married_status: switchedData.merid, nik: switchedData.noktp, npwp: switchedData.npwp, bank_name: switchedData.bankname, bank_holder: switchedData.rekname, bank_number: switchedData.reknumber, phone_office: switchedData.hp });
          break;
        case "PROGRAM":
          switchedData = currentData(programData, "idprogram");
          log(`id ${slug} data switched:`, switchedData.idprogram);
          formData.append("data", JSON.stringify({ secret, idprogram: params }));
          data = await apiRead(formData, "kpi", "viewprogramdetail");
          const programdetaildata = data.data;
          if (data && programdetaildata && programdetaildata.length > 0) {
            setInputData({ pic: switchedData.idpic, program_status: switchedData.progstatus, note: switchedData.note, program: programdetaildata.map((item) => ({ idsource: item.idsource, progname: item.progname, channel: item.channel, target: item.target, bobot: item.bobot, starttime: item.starttime, endtime: item.endtime, day: item.day, date: item.date, type: item.type })) });
          } else {
            setInputData({ pic: switchedData.idpic, program_status: switchedData.progstatus, note: switchedData.note, program: [{ idsource: "", progname: "", channel: "", target: "", bobot: "", starttime: "", endtime: "", day: "", date: 1, type: "" }] });
          }
          break;
        default:
          setSelectedData(null);
          break;
      }
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsFormFetching(false);
    }
  };

  const handleSubmit = async (e, endpoint, scope = "kpi") => {
    e.preventDefault();
    let requiredFields = [];
    switch (slug) {
      case "PEGAWAI":
        requiredFields = ["name", "phone", "email", "address", "position", "level", "division", "married_status", "nik", "npwp", "bank_name", "bank_holder", "bank_number"];
        break;
      case "PROGRAM":
        if (inputData.type === "3") {
          requiredFields = ["pic", "program_status", "program.idsource", "program.progname", "program.channel", "program.target", "program.bobot", "program.starttime", "program.endtime", "program.date"];
        } else {
          requiredFields = ["pic", "program_status", "program.idsource", "program.progname", "program.channel", "program.target", "program.bobot", "program.starttime", "program.endtime"];
        }
        break;
      case "JOB":
        requiredFields = ["job.description"];
        break;
      default:
        requiredFields = [];
        break;
    }
    const validationErrors = inputValidator(inputData, requiredFields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
        case "PEGAWAI":
          submittedData = { secret, name: inputData.name, phone: inputData.phone, email: inputData.email, address: inputData.address, position: inputData.position, akses: inputData.level, divisi: inputData.division, merid: inputData.married_status, noktp: inputData.nik, npwp: inputData.npwp, bankname: inputData.bank_name, rekname: inputData.bank_holder, reknumber: inputData.bank_number, hp: inputData.phone_office };
          break;
        case "PROGRAM":
          submittedData = { secret, idpic: inputData.pic, progstatus: inputData.program_status, note: inputData.note, detail: inputData.program };
          break;
        case "JOB":
          submittedData = { secret, idprogdetail: selectedData, detail: inputData.job.map((item) => ({ description: item.description, note: item.note, type: selectedJobType })) };
          break;
        default:
          break;
      }
      const formData = new FormData();
      formData.append("data", JSON.stringify(submittedData));
      if (slug === "PEGAWAI") {
        formData.append("fileimg", selectedImage);
      }
      if (action === "update") {
        formData.append("idedit", selectedData);
      }
      await apiCrud(formData, scope, endpoint);
      showNotifications("success", successmsg);
      log("submitted data:", submittedData);
      if (action === "add") {
        closeForm();
      } else {
        closeEdit();
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

  const handleDelete = async (params, endpoint, scope = "kpi") => {
    const confirmmsg = `Apakah anda yakin untuk menghapus data terpilih dari ${toTitleCase(slug)}?`;
    const successmsg = `Selamat! Data terpilih dari ${toTitleCase(slug)} berhasil dihapus.`;
    const errormsg = "Terjadi kesalahan saat menghapus data. Mohon periksa koneksi internet anda dan coba lagi.";
    const confirm = window.confirm(confirmmsg);
    if (!confirm) {
      return;
    }
    const formData = new FormData();
    formData.append("data", JSON.stringify({ secret }));
    formData.append("iddel", params);
    formData.append("status", "2");
    setIsToggling(true);
    try {
      await apiCrud(formData, scope, endpoint);
      showNotifications("success", successmsg);
      await fetchData();
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggle = async (e, params, status, endpoint, scope = "kpi") => {
    e.preventDefault();
    const successmsg = "Selamat! Perubahan anda berhasil disimpan.";
    const errormsg = "Terjadi kesalahan saat menyimpan perubahan. Mohon periksa koneksi internet anda dan coba lagi.";
    const formData = new FormData();
    formData.append("data", JSON.stringify({ secret }));
    formData.append("iddel", params);
    formData.append("status", status);
    setIsToggling(true);
    try {
      await apiCrud(formData, scope, endpoint);
      showNotifications("success", successmsg);
      await fetchData();
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsToggling(false);
    }
  };

  const { searchTerm: userSearch, handleSearch: handleUserSearch, filteredData: filteredUserData, isDataShown: isUserShown } = useSearch(emplyData, ["name", "phone", "position", "akses"]);
  const { searchTerm: programSearch, handleSearch: handleProgramSearch, filteredData: filteredProgramData, isDataShown: isProgramShown } = useSearch(programData, ["progname", "channel", "pic", "target", "bobot", "note"]);
  const { searchTerm: jobSearch, handleSearch: handleJobSearch, filteredData: filteredJobData, isDataShown: isJobShown } = useSearch(jobData, ["sourcename"]);

  const renderContent = () => {
    switch (slug) {
      case "PEGAWAI":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="md" isLabeled={false} placeholder="Cari data ..." type="text" value={userSearch} onChange={(e) => handleUserSearch(e.target.value)} startContent={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="md" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isUserShown} />
                <Button id={`add-new-data-${pageid}`} radius="md" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable isDeletable page={currentPage} limit={limit} isNoData={!isUserShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH type="custom" isSorted onSort={() => handleSort(emplyData, setEmplyData, "status", "number")}>
                      Status
                    </TH>
                    <TH isSorted onSort={() => handleSort(emplyData, setEmplyData, "employeecreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(emplyData, setEmplyData, "name", "text")}>
                      Nama
                    </TH>
                    <TH isSorted onSort={() => handleSort(emplyData, setEmplyData, "phone", "number")}>
                      Nomor Telepon
                    </TH>
                    <TH isSorted onSort={() => handleSort(emplyData, setEmplyData, "email", "text")}>
                      Email
                    </TH>
                    <TH isSorted onSort={() => handleSort(emplyData, setEmplyData, "address", "text")}>
                      Alamat
                    </TH>
                    <TH isSorted onSort={() => handleSort(emplyData, setEmplyData, "position", "text")}>
                      Jabatan
                    </TH>
                    <TH isSorted onSort={() => handleSort(emplyData, setEmplyData, "division", "text")}>
                      Divisi
                    </TH>
                    <TH isSorted onSort={() => handleSort(emplyData, setEmplyData, "akses", "text")}>
                      Akses Level
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredUserData.map((data, index) => (
                    <TR key={index} onEdit={() => openEdit(data.idemployee)} onDelete={() => handleDelete(data.idemployee, "cudemployee")}>
                      <TD type="custom">
                        <ToggleSwitch id={data.idemployee} isChecked={data.status === "0"} onToggle={(e) => handleToggle(e, data.idemployee, data.status === "0" ? "1" : "0", "cudemployee")} isLoading={isToggling} />
                      </TD>
                      <TD>{newDate(data.employeecreate, "id")}</TD>
                      <TD>{data.name}</TD>
                      <TD>{data.phone}</TD>
                      <TD>{data.email}</TD>
                      <TD>{data.address}</TD>
                      <TD>{data.position}</TD>
                      <TD>{data.division}</TD>
                      <TD>{data.akses}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isUserShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="lg" formTitle={selectedMode === "update" ? "Ubah Data Pegawai" : "Tambah Data Pegawai"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudemployee")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Input id={`${pageid}-name`} radius="md" labelText="Nama" placeholder="John Doe" type="text" name="name" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired />
                  <Input id={`${pageid}-email`} radius="md" labelText="Email" placeholder="employee@mail.com" type="email" name="email" value={inputData.email} onChange={handleInputChange} errorContent={errors.email} isRequired />
                  <Input id={`${pageid}-phone`} radius="md" labelText="Nomor Telepon Pribadi" placeholder="0812xxxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errorContent={errors.phone} isRequired />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-address`} radius="md" labelText="Alamat" placeholder="123 Main Street" type="text" name="address" value={inputData.address} onChange={handleInputChange} errorContent={errors.address} isRequired />
                  <Input id={`${pageid}-npwp`} radius="md" labelText="NPWP" placeholder="Masukkan NPWP" type="number" name="npwp" value={inputData.npwp} onChange={handleInputChange} errorContent={errors.npwp} isRequired />
                  <Input id={`${pageid}-phone-office`} radius="md" labelText="Nomor Telepon Kantor" placeholder="0812xxxx" type="tel" name="phone_office" value={inputData.phone_office} onChange={handleInputChange} errorContent={errors.phone_office} />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-position`} radius="md" labelText="Jabatan" placeholder="SPV" type="text" name="position" value={inputData.position} onChange={handleInputChange} errorContent={errors.position} isRequired />
                  <Input id={`${pageid}-division`} radius="md" labelText="Divisi" placeholder="Masukkan nama divisi" type="text" name="division" value={inputData.division} onChange={handleInputChange} errorContent={errors.division} isRequired />
                  <Input id={`${pageid}-level`} variant="select" noEmptyValue radius="md" labelText="Level/Akses" placeholder="Pilih level/akses" name="level" value={inputData.level} options={levelopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "level", value: selectedValue } })} errorContent={errors.level} isRequired />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-nik`} radius="md" labelText="NIK" placeholder="327xxxx" type="number" name="nik" value={inputData.nik} onChange={handleInputChange} errorContent={errors.nik} isRequired />
                  <Input id={`${pageid}-married-status`} variant="select" noEmptyValue radius="md" labelText="Status Pernikahan" placeholder="Pilih status" name="married_status" value={inputData.married_status} options={marriedstatopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "married_status", value: selectedValue } })} errorContent={errors.married_status} isRequired />
                  <Input id={`${pageid}-scanid`} variant="upload" accept="image/*" isPreview={false} radius="md" labelText="Scan KTP" name="image" initialFile={inputData.image} onSelect={handleImageSelect} />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-bank-name`} radius="md" labelText="Nama Bank" placeholder="Bank BNI" type="text" name="bank_name" value={inputData.bank_name} onChange={handleInputChange} errorContent={errors.bank_name} isRequired />
                  <Input id={`${pageid}-bank-number`} radius="md" labelText="Nomor Rekening" placeholder="43265122" type="number" name="bank_number" value={inputData.bank_number} onChange={handleInputChange} errorContent={errors.bank_number} isRequired />
                  <Input id={`${pageid}-bank-holder`} radius="md" labelText="Nama Penerima" placeholder="John Doe" type="text" name="bank_holder" value={inputData.bank_holder} onChange={handleInputChange} errorContent={errors.bank_holder} isRequired />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "PROGRAM":
        const handleTypeChange = (index, type) => {
          const newDetails = [...inputData.program];
          newDetails[index].type = type;
          setInputData({ ...inputData, program: newDetails });
        };

        const getTypeButton = (index) => {
          const buttons = [
            { label: "Harian", onClick: () => handleTypeChange(index, "1"), active: inputData.program[index].type === "1" },
            { label: "Mingguan", onClick: () => handleTypeChange(index, "2"), active: inputData.program[index].type === "2" },
            { label: "Bulanan", onClick: () => handleTypeChange(index, "3"), active: inputData.program[index].type === "3" },
          ];
          return buttons;
        };

        const handleDayChange = (index, sday) => {
          const newDetails = [...inputData.program];
          newDetails[index].day = sday;
          setInputData({ ...inputData, program: newDetails });
        };

        const getDayButton = (index) => {
          const buttons = [
            { label: "Senin", onClick: () => handleDayChange(index, "1"), active: inputData.program[index].day === "1" },
            { label: "Selasa", onClick: () => handleDayChange(index, "2"), active: inputData.program[index].day === "2" },
            { label: "Rabu", onClick: () => handleDayChange(index, "3"), active: inputData.program[index].day === "3" },
            { label: "Kamis", onClick: () => handleDayChange(index, "4"), active: inputData.program[index].day === "4" },
            { label: "Jumat", onClick: () => handleDayChange(index, "5"), active: inputData.program[index].day === "5" },
            { label: "Sabtu", onClick: () => handleDayChange(index, "6"), active: inputData.program[index].day === "6" },
            { label: "Minggu", onClick: () => handleDayChange(index, "7"), active: inputData.program[index].day === "7" },
          ];
          return buttons;
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="md" isLabeled={false} placeholder="Cari data ..." type="text" value={programSearch} onChange={(e) => handleProgramSearch(e.target.value)} startContent={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="md" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isProgramShown} />
                <Button id={`add-new-data-${pageid}`} radius="md" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isClickable page={currentPage} limit={limit} isNoData={!isProgramShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH type="custom" isSorted onSort={() => handleSort(programData, setProgramData, "progstatus", "number")}>
                      Status
                    </TH>
                    <TH isSorted onSort={() => handleSort(programData, setProgramData, "programcreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(programData, setProgramData, "picname", "text")}>
                      Nama PIC
                    </TH>
                    <TH isSorted onSort={() => handleSort(programData, setProgramData, "totaltarget", "text")}>
                      Total Target
                    </TH>
                    <TH isSorted onSort={() => handleSort(programData, setProgramData, "totalcapaian", "text")}>
                      Total Capaian
                    </TH>
                    <TH isSorted onSort={() => handleSort(programData, setProgramData, "totalbobot", "text")}>
                      Total Bobot
                    </TH>
                    <TH isSorted onSort={() => handleSort(programData, setProgramData, "totalskor", "text")}>
                      Total Skor
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredProgramData.map((data, index) => (
                    <TR key={index} onClick={() => navigate(`/${toPathname(parent)}/${toPathname(slug)}/${toPathname(data.idprogram)}`)}>
                      <TD type="custom">
                        <ToggleSwitch id={data.idprogram} isChecked={data.progstatus === "1"} onToggle={(e) => handleToggle(e, data.idprogram, data.progstatus === "0" ? "1" : "0", "cudprogram")} isLoading={isToggling} />
                      </TD>
                      <TD>{newDate(data.programcreate, "id")}</TD>
                      <TD>{data.picname}</TD>
                      <TD>{data.totaltarget}</TD>
                      <TD>{data.totalcapaian}</TD>
                      <TD>{data.totalbobot}</TD>
                      <TD>{data.totalskor}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isProgramShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="md" formTitle={selectedMode === "update" ? "Ubah Data Program" : "Tambah Data Program"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudprogram")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Input id={`${pageid}-pic`} variant="select" isSearchable radius="md" labelText="PIC" placeholder="Pilih PIC" name="pic" value={inputData.pic} options={allEmplyData.map((item) => ({ value: item.idemployee, label: item.name }))} onSelect={(selectedValue) => handleInputChange({ target: { name: "pic", value: selectedValue } })} errorContent={errors.pic} isRequired />
                  <Input id={`${pageid}-status`} variant="select" isSearchable radius="md" labelText="Status Program" placeholder="Pilih Status" name="program_status" value={inputData.program_status} options={usrstatopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "program_status", value: selectedValue } })} errorContent={errors.program_status} isRequired />
                </Fieldset>
                {inputData.program.map((item, index) => (
                  <Fieldset
                    key={index}
                    type="row"
                    markers={`${index + 1}.`}
                    endContent={
                      <Fragment>
                        <Button id={`${pageid}-delete-row-${index}`} subVariant="icon" isTooltip tooltipText="Hapus" size="sm" color={inputData.program.length <= 1 ? "var(--color-red-30)" : "var(--color-red)"} bgColor="var(--color-red-10)" iconContent={<NewTrash />} onClick={() => handleRmvRow("program", index)} isDisabled={inputData.program.length <= 1} />
                        {index + 1 === inputData.program.length && <Button id={`${pageid}-add-row`} subVariant="icon" isTooltip tooltipText="Tambah" size="sm" color="var(--color-primary)" bgColor="var(--color-primary-10)" iconContent={<Plus />} onClick={() => handleAddRow("program")} />}
                      </Fragment>
                    }>
                    <section style={{ width: "100%" }}>
                      <TabGroup buttons={getTypeButton(index)} />
                    </section>
                    {item.type === "1" ? (
                      <Fragment>
                        <Input id={`${pageid}-starttime-${index}`} radius="md" labelText="Jam Mulai" type="time" name="starttime" value={item.starttime} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.starttime`] ? errors[`program.${index}.starttime`] : ""} isRequired />
                        <Input id={`${pageid}-endtime-${index}`} radius="md" labelText="Jam Berakhir" type="time" name="endtime" value={item.endtime} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.endtime`] ? errors[`program.${index}.endtime`] : ""} isRequired />
                      </Fragment>
                    ) : item.type === "2" ? (
                      <Fragment>
                        <section style={{ width: "100%" }}>
                          <TabSwitch buttons={getDayButton(index)} />
                        </section>
                        <Input id={`${pageid}-starttime-${index}`} radius="md" labelText="Jam Mulai" type="time" name="starttime" value={item.starttime} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.starttime`] ? errors[`program.${index}.starttime`] : ""} isRequired />
                        <Input id={`${pageid}-endtime-${index}`} radius="md" labelText="Jam Berakhir" type="time" name="endtime" value={item.endtime} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.endtime`] ? errors[`program.${index}.endtime`] : ""} isRequired />
                      </Fragment>
                    ) : (
                      <Fragment>
                        <section style={{ width: "100%" }}>
                          <Input id={`${pageid}-date-${index}`} radius="md" labelText="Tanggal" type="number" placeholder="Masukkan tanggal" name="date" value={item.date} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.date`] ? errors[`program.${index}.date`] : ""} isRequired min={1} max={31} />
                        </section>
                        <Input id={`${pageid}-starttime-${index}`} radius="md" labelText="Jam Mulai" type="time" name="starttime" value={item.starttime} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.starttime`] ? errors[`program.${index}.starttime`] : ""} isRequired />
                        <Input id={`${pageid}-endtime-${index}`} radius="md" labelText="Jam Berakhir" type="time" name="endtime" value={item.endtime} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.endtime`] ? errors[`program.${index}.endtime`] : ""} isRequired />
                      </Fragment>
                    )}
                    <Input id={`${pageid}-name-${index}`} radius="md" labelText="Nama Program" placeholder="Masukkan nama program" type="text" name="progname" value={item.progname} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.progname`] ? errors[`program.${index}.progname`] : ""} isRequired />
                    <Input id={`${pageid}-source-${index}`} variant="select" isSearchable radius="md" labelText="Sumber" placeholder="Pilih sumber" name="idsource" value={item.idsource} options={allEmplyData.map((item) => ({ value: item.idemployee, label: item.name }))} onSelect={(selectedValue) => handleRowChange("program", index, { target: { name: "idsource", value: selectedValue } })} errorContent={errors[`program.${index}.idsource`] ? errors[`program.${index}.idsource`] : ""} isRequired />
                    <Input id={`${pageid}-channel-${index}`} radius="md" labelText="Channel" placeholder="Masukkan channel" type="text" name="channel" value={item.channel} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.channel`] ? errors[`program.${index}.channel`] : ""} isRequired />
                    <Input id={`${pageid}-target-${index}`} radius="md" labelText="Target" placeholder="Masukkan target" type="text" name="target" value={item.target} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.target`] ? errors[`program.${index}.target`] : ""} isRequired />
                    <Input id={`${pageid}-bobot-${index}`} radius="md" labelText="Bobot" placeholder="Masukkan bobot" type="text" name="bobot" value={item.bobot} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.bobot`] ? errors[`program.${index}.bobot`] : ""} isRequired />
                  </Fieldset>
                ))}
                <Input id={`${pageid}-note`} variant="textarea" radius="md" labelText="Catatan" placeholder="Masukkan catatan program" name="note" value={inputData.note} onChange={handleInputChange} errorContent={errors.note} rows={5} />
              </SubmitForm>
            )}
          </Fragment>
        );
      case "JOB":
        const openReport = (params, type) => {
          setSelectedData(params);
          setSelectedJobType(type);
          setIsFormOpen(true);
          log("selected job type:", type);
        };

        const handleOnpageTabChange = (id) => setOnpageTabId(id);

        const onPageTabButton = [
          { label: "Proses Hari Ini", onClick: () => handleOnpageTabChange("1"), active: onPageTabId === "1" },
          { label: "Selesai", onClick: () => handleOnpageTabChange("2"), active: onPageTabId === "2" },
          { label: "Tidak Di Kerjakan", onClick: () => handleOnpageTabChange("3"), active: onPageTabId === "3" },
        ];

        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="md" isLabeled={false} placeholder="Cari data ..." type="text" value={jobSearch} onChange={(e) => handleJobSearch(e.target.value)} startContent={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="md" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isJobShown} />
                <Button id={`add-new-data-${pageid}`} radius="md" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
              </DashboardTool>
            </DashboardToolbar>
            <TabSwitch buttons={onPageTabButton} />
            <DashboardBody>
              <Table byNumber isClickable isNoData={!isJobShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <Fragment>
                      {onPageTabId === "1" && (
                        <Fragment>
                          <TH type="custom">Action</TH>
                          <TH type="custom">Timer</TH>
                        </Fragment>
                      )}
                    </Fragment>
                    <TH isSorted onSort={() => handleSort(jobData, setJobData, "sourcename", "text")}>
                      Sumber
                    </TH>
                    <TH isSorted onSort={() => handleSort(jobData, setJobData, "progname", "text")}>
                      Nama Program
                    </TH>
                    <TH isSorted onSort={() => handleSort(jobData, setJobData, "channel", "text")}>
                      Channel
                    </TH>
                    <TH isSorted onSort={() => handleSort(jobData, setJobData, "type", "number")}>
                      Tipe
                    </TH>
                    <TH isSorted onSort={() => handleSort(jobData, setJobData, "starttime", "number")}>
                      Jam Mulai
                    </TH>
                    <TH isSorted onSort={() => handleSort(jobData, setJobData, "endtime", "number")}>
                      Jam Berakhir
                    </TH>
                    <TH isSorted onSort={() => handleSort(jobData, setJobData, "target", "number")}>
                      Target
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredJobData.map((data, index) => (
                    <TR key={index} onClick={() => navigate(`/${toPathname(parent)}/${toPathname(slug)}/${toPathname(data.idprogramdetail)}`)} isComplete={onPageTabId === "2"} isDanger={timers[index] === "00:00:00" && onPageTabId !== "2"}>
                      <Fragment>
                        {onPageTabId === "1" && (
                          <Fragment>
                            <TD type="custom">
                              {timers[index] !== "00:00:00" && <Button size="sm" buttonText="Report" onClick={() => openReport(data.idprogramdetail, data.type)} />}
                              {timers[index] === "00:00:00" && <span style={{ color: "var(--color-red)" }}>Terlewat</span>}
                            </TD>
                            <TD type="custom">{timers[index]}</TD>
                          </Fragment>
                        )}
                      </Fragment>
                      <TD>{data.sourcename}</TD>
                      <TD>{data.progname}</TD>
                      <TD>{data.channel}</TD>
                      <TD>{typeAlias(data.type)}</TD>
                      <TD>{data.starttime}</TD>
                      <TD>{data.endtime}</TD>
                      <TD>{data.target}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {/* {isJobShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />} */}
            {isFormOpen && (
              <SubmitForm size="md" formTitle="Report Hasil Pengerjaan" operation="add" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "addjob")} loading={isSubmitting} onClose={closeForm}>
                {inputData.job.map((item, index) => (
                  <Fieldset
                    key={index}
                    type="row"
                    markers={`${index + 1}.`}
                    endContent={
                      <Fragment>
                        <Button id={`${pageid}-delete-row-${index}`} subVariant="icon" isTooltip tooltipText="Hapus" size="sm" color={inputData.job.length <= 1 ? "var(--color-red-30)" : "var(--color-red)"} bgColor="var(--color-red-10)" iconContent={<NewTrash />} onClick={() => handleRmvRow("job", index)} isDisabled={inputData.job.length <= 1} />
                        {index + 1 === inputData.job.length && <Button id={`${pageid}-add-row`} subVariant="icon" isTooltip tooltipText="Tambah" size="sm" color="var(--color-primary)" bgColor="var(--color-primary-10)" iconContent={<Plus />} onClick={() => handleAddRow("job")} />}
                      </Fragment>
                    }>
                    <Input id={`${pageid}-desc-${index}`} variant="textarea" radius="md" labelText="Deskripsi Pengerjaan" name="description" placeholder="Masukkan hasil pengerjaan" value={item.description} onChange={(e) => handleRowChange("job", index, e)} errorContent={errors[`job.${index}.description`] ? errors[`job.${index}.description`] : ""} rows={5} isRequired />
                    {/* <Input id={`${pageid}-type-${index}`} variant="select" isSearchable radius="md" labelText="Tipe Program" placeholder="Pilih tipe" name="type" value={item.type} options={jobtypeopt} onSelect={(selectedValue) => handleRowChange("job", index, { target: { name: "type", value: selectedValue } })} errorContent={errors[`job.${index}.type`] ? errors[`job.${index}.type`] : ""} isRequired /> */}
                    <Input id={`${pageid}-note-${index}`} variant="textarea" radius="md" labelText="Catatan" name="note" placeholder="Masukkan catatan" value={item.note} onChange={(e) => handleRowChange("job", index, e)} errorContent={errors[`job.${index}.note`] ? errors[`job.${index}.note`] : ""} rows={5} />
                  </Fieldset>
                ))}
              </SubmitForm>
            )}
          </Fragment>
        );
      default:
        return <DashboardHead title={`Halaman Dashboard ${pagetitle} akan segera hadir.`} />;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const newTimers = { ...prevTimers };
        jobData.forEach((data, index) => {
          newTimers[index] = calculateRemainingTime(data.starttime, data.endtime);
        });
        return newTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [jobData]);

  useEffect(() => {
    setInputData({ ...inputSchema });
    setErrors({ ...errorSchema });
    setSelectedData(null);
    fetchData();
  }, [slug, currentPage, limit, slug === "JOB" ? onPageTabId : null]);

  useEffect(() => {
    setLimit(20);
    setCurrentPage(1);
    setSelectedMode("add");
    setSortOrder("asc");
    fetchAdditionalData();
  }, [slug]);

  if (!isLoggedin) {
    return <Navigate to="/login" />;
  }

  return (
    <Pages title={`${pagetitle} - Dashboard`} loading={isOptimizing}>
      <DashboardContainer>{renderContent()}</DashboardContainer>
    </Pages>
  );
};

export default DashboardSlugPage;

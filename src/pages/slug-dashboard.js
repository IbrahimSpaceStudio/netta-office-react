import React, { Fragment, useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useContent, useFormat, useDevmode } from "@ibrahimstudio/react";
import { Input } from "@ibrahimstudio/input";
import { Button } from "@ibrahimstudio/button";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { useSearch } from "../libs/plugins/handler";
import { getNestedValue, inputValidator } from "../libs/plugins/controller";
import { inputSchema, errorSchema } from "../libs/sources/common";
import { useOptions } from "../libs/plugins/helper";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";
import { SubmitForm } from "../components/input-controls/forms";
import Fieldset, { ToggleSwitch } from "../components/input-controls/inputs";
import { Search, Plus, NewTrash } from "../components/contents/icons";
import Pagination from "../components/navigations/pagination";

const DashboardSlugPage = ({ parent, slug }) => {
  const navigate = useNavigate();
  const { newDate } = useFormat();
  const { log } = useDevmode();
  const { toTitleCase, toPathname } = useContent();
  const { isLoggedin, secret } = useAuth();
  const { apiRead, apiCrud } = useApi();
  const { showNotifications } = useNotifications();
  const { limitopt, levelopt, usrstatopt } = useOptions();

  const pageid = parent && slug ? `slug-${toPathname(parent)}-${toPathname(slug)}` : "slug-dashboard";
  const pagetitle = slug ? `${toTitleCase(slug)}` : "Slug Dashboard";

  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isFormFetching, setIsFormFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedMode, setSelectedMode] = useState("add");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [emplyData, setEmplyData] = useState([]);
  const [allEmplyData, setAllEmplyData] = useState([]);
  const [programData, setProgramData] = useState([]);

  const [inputData, setInputData] = useState({ ...inputSchema });
  const [errors, setErrors] = useState({ ...errorSchema });

  const handlePageChange = (page) => setCurrentPage(page);

  const restoreInputState = () => {
    setInputData({ ...inputSchema });
    setErrors({ ...errorSchema });
  };

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
        case "JOB":
          data = await apiRead(formData, "kpi", "viewprogram");
          if (data && data.data && data.data.length > 0) {
            setProgramData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setProgramData([]);
            setTotalPages(0);
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
          setInputData({ name: switchedData.name, phone: switchedData.phone, email: switchedData.email, address: switchedData.address, position: switchedData.position, level: switchedData.akses });
          break;
        case "JOB":
          switchedData = currentData(programData, "idprogram");
          log(`id ${slug} data switched:`, switchedData.idprogram);
          formData.append("data", JSON.stringify({ secret, idprogram: params }));
          data = await apiRead(formData, "kpi", "viewprogramdetail");
          const programdetaildata = data.data;
          if (data && programdetaildata && programdetaildata.length > 0) {
            setInputData({ pic: switchedData.picname, program_status: switchedData.progstatus, program: programdetaildata.map((item) => ({ idsource: item.idsource, sourcename: item.sourcename, progname: item.progname, channel: item.channel, target: item.target, bobot: item.bobot })), note: switchedData.note });
          } else {
            setInputData({ pic: switchedData.picname, program_status: switchedData.progstatus, program: [{ idsource: "", sourcename: "", progname: "", channel: "", target: "", bobot: "" }], note: switchedData.note });
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
        requiredFields = ["name", "phone", "email", "address", "position", "level"];
        break;
      case "JOB":
        requiredFields = ["pic", "program_status", "program.progname", "program.channel", "program.target", "program.bobot"];
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
          submittedData = { secret, name: inputData.name, phone: inputData.phone, email: inputData.email, address: inputData.address, position: inputData.position, akses: inputData.level };
          break;
        case "JOB":
          submittedData = { secret, idpic: inputData.pic, picname: inputData.name, progstatus: inputData.program_status, detail: inputData.program.map((item) => ({ idsource: inputData.pic, sourcename: inputData.name, progname: item.progname, channel: item.channel, target: item.target, bobot: item.bobot })), note: inputData.note };
          break;
        default:
          break;
      }
      const formData = new FormData();
      formData.append("data", JSON.stringify(submittedData));
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
    if (confirm) {
      try {
        let submittedData;
        switch (slug) {
          case "PEGAWAI":
            submittedData = { secret };
            break;
          default:
            break;
        }
        const formData = new FormData();
        formData.append("data", JSON.stringify(submittedData));
        formData.append("iddel", params);
        if (slug === "PEGAWAI") {
          formData.append("status", "1");
        }
        await apiCrud(formData, scope, endpoint);
        showNotifications("success", successmsg);
        await fetchData();
        await fetchAdditionalData();
      } catch (error) {
        showNotifications("danger", errormsg);
        console.error(errormsg, error);
      }
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

  const renderContent = () => {
    switch (slug) {
      case "PEGAWAI":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut lectus dui." />
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
              <Table byNumber isEditable page={currentPage} limit={limit} isNoData={!isUserShown} isLoading={isFetching}>
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
                    <TH isSorted onSort={() => handleSort(emplyData, setEmplyData, "akses", "text")}>
                      Akses Level
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredUserData.map((data, index) => (
                    <TR key={index} onEdit={() => openEdit(data.idemployee)}>
                      <TD type="custom">
                        <ToggleSwitch id={data.idemployee} isChecked={data.status === "0"} onToggle={(e) => handleToggle(e, data.idemployee, data.status === "0" ? "1" : "0", "cudemployee")} isLoading={isToggling} />
                      </TD>
                      <TD>{newDate(data.employeecreate, "id")}</TD>
                      <TD>{data.name}</TD>
                      <TD>{data.phone}</TD>
                      <TD>{data.email}</TD>
                      <TD>{data.address}</TD>
                      <TD>{data.position}</TD>
                      <TD>{data.akses}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isUserShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="md" formTitle={selectedMode === "update" ? "Ubah Data Pegawai" : "Tambah Data Pegawai"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudemployee")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Input id={`${pageid}-name`} radius="md" labelText="Nama" placeholder="John Doe" type="text" name="name" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired />
                  <Input id={`${pageid}-address`} radius="md" labelText="Alamat" placeholder="123 Main Street" type="text" name="address" value={inputData.address} onChange={handleInputChange} errorContent={errors.address} isRequired />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-phone`} radius="md" labelText="Nomor Telepon" placeholder="0812xxxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errorContent={errors.phone} isRequired />
                  <Input id={`${pageid}-email`} radius="md" labelText="Email" placeholder="employee@mail.com" type="email" name="email" value={inputData.email} onChange={handleInputChange} errorContent={errors.email} isRequired />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-position`} radius="md" labelText="Jabatan" placeholder="SPV" type="text" name="position" value={inputData.position} onChange={handleInputChange} errorContent={errors.position} isRequired />
                  <Input id={`${pageid}-level`} variant="select" noEmptyValue radius="md" labelText="Level/Akses" placeholder="Pilih level/akses" name="level" value={inputData.level} options={levelopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "level", value: selectedValue } })} errorContent={errors.level} isRequired />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "JOB":
        const handlePICChange = (value) => {
          const selectedPIC = allEmplyData.find((item) => item.idemployee === value);
          if (selectedPIC) {
            setInputData({ ...inputData, pic: selectedPIC.idemployee, name: selectedPIC.name });
            log(`selected pic ${selectedPIC.name}:${selectedPIC.idemployee}`);
          } else {
            setInputData({ ...inputData, pic: "", name: "" });
          }
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut lectus dui." />
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
              <Table byNumber isEditable isClickable page={currentPage} limit={limit} isNoData={!isProgramShown} isLoading={isFetching}>
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
                    <TR key={index} onClick={() => navigate(`/${toPathname(parent)}/job/${toPathname(data.idprogram)}`)} onEdit={() => openEdit(data.idprogram)}>
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
                  <Input id={`${pageid}-pic`} variant="select" isSearchable radius="md" labelText="PIC" placeholder="Pilih PIC" name="pic" value={inputData.pic} options={allEmplyData.map((item) => ({ value: item.idemployee, label: item.name }))} onSelect={handlePICChange} errorContent={errors.pic} isRequired />
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
                    <Input id={`${pageid}-name-${index}`} radius="full" labelText="Nama Program" placeholder="Masukkan nama program" type="text" name="progname" value={item.progname} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.progname`] ? errors[`program.${index}.progname`] : ""} isRequired />
                    <Input id={`${pageid}-channel-${index}`} radius="full" labelText="Channel" placeholder="Masukkan channel" type="text" name="channel" value={item.channel} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.channel`] ? errors[`program.${index}.channel`] : ""} isRequired />
                    <Input id={`${pageid}-target-${index}`} radius="full" labelText="Target" placeholder="Masukkan target" type="text" name="target" value={item.target} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.target`] ? errors[`program.${index}.target`] : ""} isRequired />
                    <Input id={`${pageid}-bobot-${index}`} radius="full" labelText="Bobot" placeholder="Masukkan bobot" type="text" name="bobot" value={item.bobot} onChange={(e) => handleRowChange("program", index, e)} errorContent={errors[`program.${index}.bobot`] ? errors[`program.${index}.bobot`] : ""} isRequired />
                  </Fieldset>
                ))}
                <Input id={`${pageid}-note`} variant="textarea" radius="md" labelText="Catatan" placeholder="Masukkan catatan program" name="note" value={inputData.note} onChange={handleInputChange} errorContent={errors.note} rows={5} />
              </SubmitForm>
            )}
          </Fragment>
        );
      default:
        return <DashboardHead title={`Halaman Dashboard ${pagetitle} akan segera hadir.`} />;
    }
  };

  useEffect(() => {
    setInputData({ ...inputSchema });
    setErrors({ ...errorSchema });
    setSelectedData(null);
    fetchData();
  }, [slug, currentPage, limit]);

  useEffect(() => {
    setLimit(5);
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

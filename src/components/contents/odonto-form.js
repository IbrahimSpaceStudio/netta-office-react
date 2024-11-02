import React from "react";
import { Input } from "@ibrahimstudio/input";
import { Button } from "@ibrahimstudio/button";
import { LoadingContent } from "../feedbacks/screens";
import { Search, NewTrash, NewEdit } from "./icons";
import styles from "./styles/odonto-form.module.css";

export const ConditionLi = ({ label, name, isActive = false, onClick = () => {} }) => {
  return (
    <section className={`${styles.conditionLi} ${isActive ? styles.active : ""}`} onClick={onClick}>
      <span className={styles.liText}>
        <span style={{ color: "var(--color-primary)" }}>{label}</span>
        {` - ${name}`}
      </span>
    </section>
  );
};

export const OdontoCondition = ({ children }) => {
  return (
    <aside className={styles.odontoCondition}>
      <OdontoHead text="Kondisi" />
      <section className={styles.conditionSearch}>
        <Input id="search-data" radius="md" isLabeled={false} placeholder="Cari kondisi ..." type="text" startContent={<Search />} />
      </section>
      <section className={styles.conditionUl}>{children}</section>
    </aside>
  );
};

const ScoreInput = ({ label, name, value, onChange, isReadonly = false }) => {
  return (
    <section className={styles.scoreInput}>
      <label className={styles.inputLabel}>{label}</label>
      <input className={`${styles.inputField} ${isReadonly ? styles.readonly : ""}`} placeholder="0" type="number" name={name} value={value} onChange={onChange} readOnly={isReadonly} />
    </section>
  );
};

const ScoreRows = ({ children }) => {
  return <div className={styles.scoreRow}>{children}</div>;
};

export const GramBlock = ({ topLabel, botLabel, type = "front", onClick = () => {} }) => {
  return (
    <section className={styles.gramBlock}>
      {topLabel && <span className={styles.blockLabel}>{topLabel}</span>}
      <div className={styles.blockArea} onClick={onClick}>
        <img className={styles.blockImgIcon} alt={topLabel ? topLabel : botLabel} src={type === "inner" ? "/svg/inner-block.svg" : "/svg/front-block.svg"} />
      </div>
      {botLabel && <span className={styles.blockLabel}>{botLabel}</span>}
    </section>
  );
};

export const GramRows = ({ children }) => {
  return <section className={styles.gramRows}>{children}</section>;
};

export const GramMarker = ({ alt, src }) => {
  return <img className={styles.topMarkerIcon} alt={alt} src={src} />;
};

export const GramSet = ({ type = "top", children }) => {
  return type === "top" ? <div className={styles.gramTop}>{children}</div> : type === "bot" ? <div className={styles.gramBot}>{children}</div> : type === "center-child" ? <div className={styles.gramCenterTop}>{children}</div> : <div className={styles.gramCenter}>{children}</div>;
};

export const OdontoGram = ({ submitting, inputData, setInputData, dmfT, defT, action, children }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({ ...prevState, [name]: value }));
  };

  return (
    <section className={styles.odontoGram}>
      <OdontoHead text="Odontogram" />
      <article className={styles.gramField}>
        {children}
        <section className={styles.gramScore}>
          <ScoreRows>
            <ScoreInput label="D" name="dmf_d" value={inputData.dmf_d} onChange={handleInputChange} />
            <ScoreInput label="M" name="dmf_m" value={inputData.dmf_m} onChange={handleInputChange} />
            <ScoreInput label="F" name="dmf_f" value={inputData.dmf_f} onChange={handleInputChange} />
            <ScoreInput label="DMF-T" value={dmfT} isReadonly />
          </ScoreRows>
          <ScoreRows>
            <ScoreInput label="D" name="def_d" value={inputData.def_d} onChange={handleInputChange} />
            <ScoreInput label="e" name="def_e" value={inputData.def_e} onChange={handleInputChange} />
            <ScoreInput label="F" name="def_f" value={inputData.def_f} onChange={handleInputChange} />
            <ScoreInput label="DeF-T" value={defT} isReadonly />
          </ScoreRows>
        </section>
        <Button id="handle-form-submit" radius="md" action={action} type="submit" buttonText="Simpan" isLoading={submitting} loadingContent={<LoadingContent />} />
      </article>
    </section>
  );
};

export const HistoryTr = ({ no, label = [], isEditable = false, onEdit = () => {}, onDelete = () => {} }) => {
  return (
    <section className={styles.historyTr}>
      <div className={styles.trNo}>
        <span className={styles.noText}>{no}</span>
      </div>
      <div className={styles.trTd}>
        <span className={styles.tdText}>
          {label.map((item, index) => (
            <span key={index}>{label.length === index + 1 ? `${item.singkatan}` : `${item.singkatan} - `}</span>
          ))}
        </span>
      </div>
      {isEditable && (
        <div className={styles.trCbox} style={{ cursor: "pointer" }} onClick={onEdit}>
          <NewEdit color="var(--color-primary)" />
        </div>
      )}
      <div className={styles.trCbox} style={{ cursor: "pointer" }} onClick={onDelete}>
        <NewTrash color="var(--color-red)" />
      </div>
    </section>
  );
};

export const OdontoHistory = ({ deleting, onDeleteAll = () => {}, children }) => {
  return (
    <aside className={styles.odontoHistory}>
      <OdontoHead text="Riwayat" />
      <section className={styles.historyThead}>
        <div className={styles.theadNo}>
          <span className={styles.noText}>no.</span>
        </div>
        <div className={styles.theadTh}>
          <span className={styles.thText}>Deskripsi</span>
        </div>
        <div className={styles.theadCbox} style={{ cursor: "pointer" }} onClick={onDeleteAll}>
          <NewTrash color="var(--color-red)" />
        </div>
      </section>
      <section className={styles.historyTbody} style={deleting ? { opacity: "0.5" } : { opacity: "1" }}>
        {children}
      </section>
    </aside>
  );
};

const OdontoHead = ({ text }) => {
  return (
    <header className={styles.historyHead}>
      <h1 className={styles.headText}>{text}</h1>
    </header>
  );
};

const OdontoForm = ({ children, onSubmit, submitting = false, deleting = false }) => {
  return (
    <form className={styles.odontoForm} onSubmit={onSubmit}>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, { submitting, deleting });
      })}
    </form>
  );
};

export default OdontoForm;

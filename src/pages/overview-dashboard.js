import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../libs/securities/auth";
import styles from "./styles/dashboard.module.css";

export const DashboardBody = ({ children }) => {
  return <div className={styles.sectionBody}>{children}</div>;
};

export const DashboardTool = ({ children }) => {
  return <div className={styles.sectionTool}>{children}</div>;
};

export const DashboardToolbar = ({ children }) => {
  return <nav className={styles.sectionNav}>{children}</nav>;
};

export const DashboardHead = ({ title, desc }) => {
  return (
    <header className={styles.sectionHead}>
      <h1 className={styles.sectionTitle}>{title}</h1>
      {desc && <p className={styles.sectionDesc}>{desc}</p>}
    </header>
  );
};

export const DashboardContainer = ({ children }) => {
  return <section className={styles.section}>{children}</section>;
};

const DashboardOverviewPage = () => {
  const { isLoggedin, level } = useAuth();

  if (!isLoggedin) {
    return <Navigate to="/login" />;
  }

  if (level === "STAFF") {
    return <Navigate to="/program/job" />;
  } else {
    return <Navigate to="/master/pegawai" />;
  }
};

export default DashboardOverviewPage;

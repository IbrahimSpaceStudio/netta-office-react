export const useOptions = () => {
  const limitopt = [
    { value: 20, label: "Baris per Halaman: 20" },
    { value: 100, label: "Baris per Halaman: 100" },
    { value: 500, label: "Baris per Halaman: 500" },
  ];
  const genderopt = [
    { value: "male", label: "Laki-laki" },
    { value: "female", label: "Perempuan" },
  ];
  const levelopt = [
    { value: "ADMIN", label: "Admin" },
    { value: "STAFF", label: "Pegawai" },
  ];
  const marriedstatopt = [
    { value: "kawin", label: "Kawin" },
    { value: "belum kawin", label: "Belum Kawin" },
  ];
  const usrstatopt = [
    { value: "1", label: "Aktif" },
    { value: "0", label: "Nonaktif" },
  ];
  const unitopt = [
    { value: "PCS", label: "pcs" },
    { value: "PACK", label: "pack" },
    { value: "BOTTLE", label: "bottle" },
    { value: "TUBE", label: "tube" },
    { value: "BOX", label: "box" },
    { value: "SET", label: "set" },
  ];
  const houropt = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
  const postatopt = [
    { value: "0", label: "Open" },
    { value: "2", label: "Sent" },
    { value: "3", label: "Done" },
    { value: "4", label: "Rejected" },
  ];
  const pocstatopt = [{ value: "3", label: "Done" }];
  const reservstatopt = [
    { value: "0", label: "Pending" },
    { value: "2", label: "Reschedule" },
    { value: "3", label: "Batal" },
  ];
  const paymentstatopt = [
    { value: "0", label: "Pending" },
    { value: "3", label: "Batal" },
  ];
  const paymenttypeopt = [
    { value: "cash", label: "Cash in Store" },
    { value: "cashless", label: "Cashless (via Xendit)" },
    { value: "insurance", label: "Asuransi" },
    { value: "indodana", label: "Indodana" },
    { value: "rata", label: "RATA" },
  ];
  const orderstatopt = [
    { value: "0", label: "Pending" },
    { value: "1", label: "Paid" },
    { value: "2", label: "Canceled" },
  ];
  const reportstatopt = [
    { value: "3", label: "Semua Status" },
    { value: "0", label: "Open" },
    { value: "1", label: "Lunas" },
    { value: "2", label: "Batal" },
  ];
  const stockoutstatopt = [
    { value: "Barang Habis Pakai", label: "Barang Habis Pakai" },
    { value: "Barang Tidak Habis Pakai", label: "Barang Tidak Habis Pakai" },
  ];
  const diagnoseopt = [
    { value: "Diagnosa Utama", label: "Diagnosa Utama" },
    { value: "Diagnosa Sekunder", label: "Diagnosa Sekunder" },
    { value: "Diagnosa Komplikasi", label: "Diagnosa Komplikasi" },
  ];
  return { limitopt, genderopt, levelopt, usrstatopt, unitopt, houropt, postatopt, pocstatopt, reservstatopt, paymentstatopt, paymenttypeopt, orderstatopt, reportstatopt, stockoutstatopt, diagnoseopt, marriedstatopt };
};

export const useOdontogram = () => {
  const topleft = [
    { no: "18", type: "inner" },
    { no: "17", type: "inner" },
    { no: "16", type: "inner" },
    { no: "15", type: "inner" },
    { no: "14", type: "inner" },
    { no: "13", type: "front" },
    { no: "12", type: "front" },
    { no: "11", type: "front" },
  ];
  const topright = [
    { no: "21", type: "front" },
    { no: "22", type: "front" },
    { no: "23", type: "front" },
    { no: "24", type: "inner" },
    { no: "25", type: "inner" },
    { no: "26", type: "inner" },
    { no: "27", type: "inner" },
    { no: "28", type: "inner" },
  ];
  const centertopleft = [
    { no: "55", type: "inner" },
    { no: "54", type: "inner" },
    { no: "53", type: "front" },
    { no: "52", type: "front" },
    { no: "51", type: "front" },
  ];
  const centertopright = [
    { no: "61", type: "front" },
    { no: "62", type: "front" },
    { no: "63", type: "front" },
    { no: "64", type: "inner" },
    { no: "65", type: "inner" },
  ];
  const centerbotleft = [
    { no: "85", type: "inner" },
    { no: "84", type: "inner" },
    { no: "83", type: "front" },
    { no: "82", type: "front" },
    { no: "81", type: "front" },
  ];
  const centerbotright = [
    { no: "71", type: "front" },
    { no: "72", type: "front" },
    { no: "73", type: "front" },
    { no: "74", type: "inner" },
    { no: "75", type: "inner" },
  ];
  const botleft = [
    { no: "48", type: "inner" },
    { no: "47", type: "inner" },
    { no: "46", type: "inner" },
    { no: "45", type: "inner" },
    { no: "44", type: "inner" },
    { no: "43", type: "front" },
    { no: "42", type: "front" },
    { no: "41", type: "front" },
  ];
  const botright = [
    { no: "31", type: "front" },
    { no: "32", type: "front" },
    { no: "33", type: "front" },
    { no: "34", type: "inner" },
    { no: "35", type: "inner" },
    { no: "36", type: "inner" },
    { no: "37", type: "inner" },
    { no: "38", type: "inner" },
  ];
  return { topleft, topright, centertopleft, centertopright, centerbotleft, centerbotright, botleft, botright };
};

export const useAlias = () => {
  const paymentAlias = (status) => {
    return status === "1" ? "Exist" : status === "2" ? "Paid" : status === "3" ? "Canceled" : "Pending";
  };
  const orderAlias = (status) => {
    return status === "1" ? "Paid" : status === "2" ? "Canceled" : "Open";
  };
  const invoiceAlias = (status) => {
    return status === "1" ? "Lunas" : status === "2" ? "Dibatalkan" : "Belum Lunas";
  };
  const poAlias = (status) => {
    return status === "1" ? "Pending" : status === "2" ? "Sent" : status === "3" ? "Done" : status === "4" ? "Rejected" : "Open";
  };
  const usrstatAlias = (status) => {
    return status === "0" ? "Aktif" : "Pending";
  };
  const reservAlias = (status) => {
    return status === "1" ? "Completed" : status === "2" ? "Reschedule" : status === "3" ? "Canceled" : "Pending";
  };
  const typeAlias = (type) => {
    return type === "1" ? "Harian" : type === "2" ? "Mingguan" : "Bulanan";
  };
  return { paymentAlias, orderAlias, invoiceAlias, poAlias, usrstatAlias, reservAlias, typeAlias };
};

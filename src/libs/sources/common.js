export const inputSchema = {
  name: "",
  phone: "",
  address: "",
  postcode: "",
  main_region: "",
  region: "",
  cctr_group: "",
  cctr: "",
  coordinate: "",
  service: "",
  sub_service: "",
  category: "",
  sub_category: "",
  unit: "",
  count: "",
  value: "",
  id: "",
  email: "",
  vouchercode: "",
  date: "",
  time: "",
  price: 0,
  bank_code: "",
  note: "",
  dentist: "",
  status: "",
  statuspayment: "",
  typepayment: "",
  layanan: [{ servicetype: "", price: "" }],
  order: [{ service: "", servicetype: "", price: "" }],
  postock: [{ idstock: "", itemname: "", sku: "", stockin: "", note: "" }],
  birth: "",
  nik: "",
  gender: "",
  room: "",
  ageyear: "",
  agemonth: "",
  ageday: "",
  image: null,
  histori_illness: "",
  main_complaint: "",
  additional_complaint: "",
  current_illness: "",
  gravida: "",
  alergi_gatal: '{"alergi":"gatal","note":""}',
  alergi_debu: '{"alergi":"debu","note":""}',
  alergi_obat: '{"alergi":"obat","note":""}',
  alergi_makanan: '{"alergi":"makanan","note":""}',
  alergi_lainnya: '{"alergi":"lainnya","note":""}',
  occlusi: "",
  palatinus: "",
  mandibularis: "",
  palatum: "",
  diastema: "",
  anomali: "",
  other_odontogram: "",
  desc: "",
  nadi: "",
  tensi: "",
  suhu: "",
  berat_badan: "",
  tinggi_badan: "",
  pernapasan: "",
  mata: "",
  mulut_gigi: "",
  kulit: "",
  username: "",
  password: "",
  level: "",
  sip: "",
  outlet: "",
  rscode: "",
  alkesitem: [{ idstock: "", categorystock: "", subcategorystock: "", sku: "", itemname: "", unit: "", qty: "", status: "" }],
  stockexp: [{ idstock: "", categorystock: "", subcategorystock: "", sku: "", itemname: "", unit: "", qty: "", status: "expire" }],
  recipe: "",
  diagnose: "",
  diagnosecode: "",
  diagnosedetail: "",
  diagdetail: [{ diagnosisdetail: "" }],
  dmf_d: "",
  dmf_m: "",
  dmf_f: "",
  def_d: "",
  def_e: "",
  def_f: "",
  city_name: "",
  city: "",
  province: "",
  district: "",
  village: "",
  rt: "",
  rw: "",
  postal_code: "",
  birth_date: "",
  str: "",
  practici_id: "",
  dept: "",
  identifier: "",
  reference: "",
  nik: "",
  client_id: "",
  secret_id: "",
  position: "",
  access: "",
  channel: "",
  pic: "",
  target: "",
  bobot: "",
  program_status: "",
  program: [{ idsource: "", progname: "", channel: "", target: "", bobot: "", startdate: "", enddate: "" }],
  division: "",
  source: "",
};

export const errorSchema = {
  name: "",
  phone: "",
  address: "",
  postcode: "",
  main_region: "",
  region: "",
  cctr_group: "",
  cctr: "",
  coordinate: "",
  service: "",
  sub_service: "",
  category: "",
  sub_category: "",
  unit: "",
  count: "",
  value: "",
  id: "",
  email: "",
  vouchercode: "",
  date: "",
  time: "",
  price: "",
  bank_code: "",
  note: "",
  dentist: "",
  status: "",
  statuspayment: "",
  typepayment: "",
  layanan: [{}],
  order: [{ service: "", servicetype: "", price: "" }],
  postock: [{ idstock: "", itemname: "", sku: "", stockin: "", note: "" }],
  birth: "",
  nik: "",
  gender: "",
  room: "",
  ageyear: "",
  agemonth: "",
  ageday: "",
  image: null,
  histori_illness: "",
  main_complaint: "",
  additional_complaint: "",
  current_illness: "",
  gravida: "",
  alergi_gatal: '{"alergi":"gatal","note":""}',
  alergi_debu: '{"alergi":"debu","note":""}',
  alergi_obat: '{"alergi":"obat","note":""}',
  alergi_makanan: '{"alergi":"makanan","note":""}',
  alergi_lainnya: '{"alergi":"lainnya","note":""}',
  occlusi: "",
  palatinus: "",
  mandibularis: "",
  palatum: "",
  diastema: "",
  anomali: "",
  other_odontogram: "",
  desc: "",
  nadi: "",
  tensi: "",
  suhu: "",
  berat_badan: "",
  tinggi_badan: "",
  pernapasan: "",
  mata: "",
  mulut_gigi: "",
  kulit: "",
  username: "",
  password: "",
  level: "",
  sip: "",
  outlet: "",
  rscode: "",
  alkesitem: [{ idstock: "", categorystock: "", subcategorystock: "", sku: "", itemname: "", unit: "", qty: "", status: "" }],
  stockexp: [{ idstock: "", categorystock: "", subcategorystock: "", sku: "", itemname: "", unit: "", qty: "", status: "expire" }],
  recipe: "",
  diagnose: "",
  diagnosecode: "",
  diagnosedetail: "",
  diagdetail: [{ diagnosisdetail: "" }],
  dmf_d: "",
  dmf_m: "",
  dmf_f: "",
  def_d: "",
  def_e: "",
  def_f: "",
  city_name: "",
  city: "",
  province: "",
  district: "",
  village: "",
  rt: "",
  rw: "",
  postal_code: "",
  birth_date: "",
  str: "",
  practici_id: "",
  dept: "",
  identifier: "",
  reference: "",
  nik: "",
  client_id: "",
  secret_id: "",
  position: "",
  access: "",
  channel: "",
  pic: "",
  target: "",
  bobot: "",
  program_status: "",
  program: [{ idsource: "", progname: "", channel: "", target: "", bobot: "", startdate: "", enddate: "" }],
  division: "",
  source: "",
};

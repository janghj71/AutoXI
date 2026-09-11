import { useCallback, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileJson,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import Button from "../../components/Button";
import FixedHeadTable from "../../components/FixedHeadTable";
import Modal from "../../components/Modal";

// EST2026 AOS 불러오기와 동일한 파일 prefix / 데이터 키 규칙
const PREFIX_RULES = {
  "01": {
    seccode: "12",
    isest: "1",
    masterKey: "AOS_ESTIMASTER",
    detailKey: "AOS_ESTIMASTERB",
    hasSmaster: true,
    hpField: "D_TEL",
  },
  "02": {
    seccode: "12",
    isest: "0",
    masterKey: "AOS_TMASTER",
    detailKey: "AOS_TMASTERB",
    hasSmaster: true,
    hpField: "HPTEL",
  },
  11: {
    seccode: "11",
    isest: "1",
    masterKey: "AOS_IMASTER",
    detailKey: "AOS_IMASTERB",
    hasSmaster: false,
    hpField: "HPTEL",
  },
  12: {
    seccode: "11",
    isest: "0",
    masterKey: "AOS_IMASTER",
    detailKey: "AOS_IMASTERB",
    hasSmaster: false,
    hpField: "HPTEL",
  },
};
const PAYKIND_LABEL = {
  1: "공임",
  2: "공임",
  3: "부품",
  4: "공임",
  5: "부품",
  6: "도장",
};
const WORK_MAP = {
  R: "탈착",
  X: "교환",
  B: "판금",
  A: "조정",
  O: "오버홀",
  S: "수리",
  P: "도장",
  T: "견인",
  G: "구난",
  W: "세차",
};
const kindLabel = (seccode, isest) =>
  seccode === "12"
    ? isest === "1"
      ? "보험견적"
      : "보험청구"
    : isest === "1"
      ? "일반견적"
      : "일반청구";
const kindColor = (seccode, isest) =>
  seccode === "12"
    ? isest === "1"
      ? "bg-blue-100 text-blue-700"
      : "bg-violet-100 text-violet-700"
    : isest === "1"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-orange-100 text-orange-700";
const money = (value) => {
  const amount = Number(String(value ?? "").replaceAll(",", ""));
  return Number.isFinite(amount) && amount !== 0
    ? amount.toLocaleString("ko-KR")
    : "";
};

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(new Error(`파일 읽기 실패: ${file.name}`));
    reader.readAsText(file, "euc-kr");
  });
}
function mapFile(json, rule, filename) {
  const master = json[rule.masterKey]?.[0];
  if (!master) throw new Error(`${rule.masterKey} 마스터 정보가 없습니다.`);
  const details = (json[rule.detailKey] ?? []).map((detail) => ({
    paykind: detail.KIND || "",
    payno: detail.PAYNO || "",
    subpayno: detail.SUBPAYNO || "",
    payname: detail.PAYNAME || "",
    workcode: detail.WORKKIND || "",
    price: detail.PRICE || "0",
    qty: detail.QTY || "",
    partsum: detail.PARTSUM || "0",
    paysum: detail.PAYSUM || "0",
    part_makercode: detail.PARTNO || "",
    part_state: detail.PARTKIND || "",
    ts_payno: "",
  }));
  return {
    master: {
      carno: master.CARNO || "",
      carcode: master.CARCODE || "",
      carname: master.CARNAME || "",
      modelcode: master.MODELCODE || "",
      modelname: master.MODELNAME || "",
      caryear: (master.MAKEDAY || "").slice(0, 4),
      car_registday: master.MAKEDAY || "",
      lastkm: master.GOKM || "0",
      custom_name: master.OWNER || "",
      seccode: rule.seccode,
      inday: master.INDAY || "",
      outday: master.OUTDAY || "",
      accday: master.ACCDAY || "",
      vat: master.VATKIND || "",
      isest: rule.isest,
      carno4: rule.hasSmaster
        ? (master.CARNO || "").slice(-4)
        : master.CARNO4 || "",
      regno: rule.hasSmaster ? json.AOS_SMASTER?.[0]?.REGNO || "" : "",
      aos_serial: rule.hasSmaster
        ? json.AOS_SMASTER?.[0]?.TKEY || ""
        : master.TKEY || "",
      add_repair: "1",
      vinno: "",
      filename,
    },
    details,
  };
}
async function parseFile(file) {
  const rule = PREFIX_RULES[file.name.slice(0, 2)];
  if (!rule)
    throw new Error(`알 수 없는 파일 prefix: "${file.name.slice(0, 2)}"`);
  return mapFile(JSON.parse(await readFile(file)), rule, file.name);
}

function DetailTable({ rows }) {
  if (!rows?.length)
    return <div className="py-2 text-xs text-gray-400">상세 데이터 없음</div>;
  return (
    <div className="overflow-hidden rounded border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-gray-100">
          <tr>
            <th className="w-[28px] px-2 py-1 text-center font-semibold text-gray-600">
              No
            </th>
            <th className="w-[40px] px-2 py-1 text-center font-semibold text-gray-600">
              구분
            </th>
            <th className="w-[90px] px-2 py-1 text-left font-semibold text-gray-600">
              품번
            </th>
            <th className="px-2 py-1 text-left font-semibold text-gray-600">
              작업내용
            </th>
            <th className="w-[50px] whitespace-nowrap px-2 py-1 text-center font-semibold text-gray-600">
              작업
            </th>
            <th className="w-[46px] px-2 py-1 text-right font-semibold text-gray-600">
              수량
            </th>
            <th className="w-[70px] px-2 py-1 text-right font-semibold text-gray-600">
              공임
            </th>
            <th className="w-[70px] px-2 py-1 text-right font-semibold text-gray-600">
              부품
            </th>
            <th className="w-[60px] whitespace-nowrap px-2 py-1 text-center font-semibold text-gray-600">
              부품종류
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.payno}-${index}`}
              className="border-t border-gray-100 hover:bg-gray-50"
            >
              <td className="px-2 py-0.5 text-center text-gray-400">
                {index + 1}
              </td>
              <td className="px-2 py-0.5 text-center">
                {PAYKIND_LABEL[row.paykind] || row.paykind}
              </td>
              <td className="truncate px-2 py-0.5" title={row.part_makercode}>
                {row.part_makercode}
              </td>
              <td className="truncate px-2 py-0.5" title={row.payname}>
                {row.payname}
              </td>
              <td className="whitespace-nowrap px-2 py-0.5 text-center">
                {WORK_MAP[row.workcode] || row.workcode}
              </td>
              <td className="px-2 py-0.5 text-right">{row.qty}</td>
              <td className="px-2 py-0.5 text-right">{money(row.paysum)}</td>
              <td className="px-2 py-0.5 text-right">{money(row.partsum)}</td>
              <td className="px-2 py-0.5 text-center">{row.part_state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function InsuranceEstimate2017Modal({ onClose }) {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileItems, setFileItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [filterKind, setFilterKind] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [resultMap] = useState({});
  const addFiles = useCallback(async (list) => {
    const files = Array.from(list || []).filter((file) =>
      file.name.toLowerCase().endsWith(".json"),
    );
    if (!files.length) return;
    const parsed = await Promise.all(
      files.map(async (file) => {
        const id = `${file.name}_${file.lastModified}`;
        try {
          const { master, details } = await parseFile(file);
          return {
            id,
            filename: file.name,
            carno: master.carno,
            carname: master.carname,
            custom_name: master.custom_name,
            inday: master.inday,
            outday: master.outday,
            seccode: master.seccode,
            isest: master.isest,
            detailCount: details.length,
            parseError: "",
            master,
            details,
          };
        } catch (error) {
          return {
            id,
            filename: file.name,
            carno: "",
            carname: "",
            custom_name: "",
            inday: "",
            outday: "",
            seccode: "",
            isest: "",
            detailCount: 0,
            parseError: error.message || "파싱 오류",
            master: null,
            details: [],
          };
        }
      }),
    );
    setFileItems((previous) => {
      const ids = new Set(previous.map((item) => item.id));
      const fresh = parsed.filter((item) => !ids.has(item.id));
      setSelectedIds(
        (selected) =>
          new Set([
            ...selected,
            ...fresh
              .filter((item) => !item.parseError && item.detailCount > 0)
              .map((item) => item.id),
          ]),
      );
      return [...previous, ...fresh];
    });
  }, []);
  const validItems = useMemo(
    () => fileItems.filter((item) => !item.parseError),
    [fileItems],
  );
  const selectable = useMemo(
    () =>
      validItems.filter(
        (item) => item.detailCount > 0 && !resultMap[item.filename],
      ),
    [validItems, resultMap],
  );
  const selectedCount = validItems.filter((item) =>
    selectedIds.has(item.id),
  ).length;
  const errors = fileItems.filter((item) => item.parseError);
  const allChecked =
    selectable.length > 0 &&
    selectable.every((item) => selectedIds.has(item.id));
  const filters = useMemo(() => {
    const counts = { 보험견적: 0, 보험청구: 0, 일반견적: 0, 일반청구: 0 };
    validItems.forEach((item) => {
      counts[kindLabel(item.seccode, item.isest)] += 1;
    });
    return [
      { key: "all", label: "전체", count: validItems.length },
      ...Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([key, count]) => ({ key, label: key, count })),
    ];
  }, [validItems]);
  const visible = useMemo(() => {
    const keyword = filterSearch.trim().toLowerCase();
    return fileItems.filter(
      (item) =>
        (filterKind === "all" ||
          item.parseError ||
          kindLabel(item.seccode, item.isest) === filterKind) &&
        (!keyword ||
          `${item.carno} ${item.custom_name}`.toLowerCase().includes(keyword)),
    );
  }, [fileItems, filterKind, filterSearch]);
  const toggle = (id) =>
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const columns = [
    {
      key: "select",
      title: "",
      width: "5%",
      align: "center",
      render: (_value, item) =>
        !item.parseError &&
        item.detailCount > 0 &&
        !resultMap[item.filename] && (
          <input
            type="checkbox"
            aria-label={`${item.filename} 선택`}
            checked={selectedIds.has(item.id)}
            onClick={(event) => event.stopPropagation()}
            onChange={() => toggle(item.id)}
            className="size-4 accent-green-600"
          />
        ),
    },
    {
      key: "kind",
      title: "구분",
      width: "12%",
      align: "center",
      render: (_value, item) =>
        item.parseError ? (
          <span className="text-xs text-red-500">파싱오류</span>
        ) : (
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${kindColor(item.seccode, item.isest)}`}
          >
            {kindLabel(item.seccode, item.isest)}
          </span>
        ),
    },
    { key: "inday", title: "입고일자", width: "11%" },
    { key: "outday", title: "출고일자", width: "11%" },
    { key: "carno", title: "차량번호", width: "12%" },
    { key: "carname", title: "차량명", width: "15%" },
    { key: "custom_name", title: "고객명", width: "11%" },
    {
      key: "detail",
      title: "상세",
      width: "11%",
      align: "center",
      render: (_value, item) =>
        item.parseError ? (
          "—"
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpandedId((previous) =>
                previous === item.id ? null : item.id,
              );
            }}
            className="inline-flex items-center gap-0.5 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
          >
            {expandedId === item.id ? (
              <ChevronDown size={13} />
            ) : (
              <ChevronRight size={13} />
            )}
            {item.detailCount}건
          </button>
        ),
    },
    {
      key: "status",
      title: "상태",
      width: "12%",
      align: "center",
      render: (_value, item) =>
        item.parseError ? (
          <span className="inline-flex items-center gap-1 text-xs text-red-600">
            <XCircle size={13} />
            오류
          </span>
        ) : resultMap[item.filename] ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 size={13} />
            성공
          </span>
        ) : (
          <span className="text-xs text-gray-300">대기</span>
        ),
    },
  ];
  return (
    <Modal
      title={
        <span className="inline-flex items-center gap-1.5">
          <FileJson size={17} className="text-green-600" />
          보험견적 2017 불러오기
        </span>
      }
      description="AOS 견적 JSON 파일을 첨부해 가져올 내역을 확인합니다."
      onClose={onClose}
      dialogStyle={{ maxWidth: "860px" }}
      footer={
        <>
          <Button onClick={onClose}>취소</Button>
          <Button variant="primary" disabled={selectedCount === 0}>
            불러오기 실행 ({selectedCount}건)
          </Button>
        </>
      }
    >
      <div className="flex h-[620px] min-h-0 flex-col gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          className={`shrink-0 rounded-md border-2 border-dashed px-6 py-6 text-center ${dragging ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}`}
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={30} />
          <span className="block text-sm font-semibold text-gray-700">
            JSON 파일을 여기에 드래그하거나 클릭하여 선택
          </span>
          <span className="mt-1 block text-xs text-gray-400">
            여러 파일 동시 선택 가능 · .json 파일만
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            multiple
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </button>
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-gray-50 px-3 py-2">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-600">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={() =>
                  setSelectedIds(
                    allChecked
                      ? new Set()
                      : new Set(selectable.map((item) => item.id)),
                  )
                }
                className="size-4 accent-green-600"
              />
              전체선택
            </label>
            <span className="text-sm font-semibold text-gray-800">
              {fileItems.length}건 로드
              {errors.length > 0 && (
                <span className="ml-2 text-xs font-normal text-red-600">
                  · 오류 {errors.length}건
                </span>
              )}
            </span>
            <span className="ml-auto text-xs text-gray-500">
              선택 {selectedCount}건
            </span>
            {fileItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFileItems([]);
                  setSelectedIds(new Set());
                  setExpandedId(null);
                  setFilterKind("all");
                  setFilterSearch("");
                }}
                className="text-xs text-gray-400 hover:text-gray-700"
              >
                전체삭제
              </button>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-100 px-3 py-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => {
                  setFilterKind(filter.key);
                  setExpandedId(null);
                }}
                className={`inline-flex w-[92px] items-center justify-center gap-1 rounded-full border py-1 text-xs font-semibold ${filterKind === filter.key ? "border-green-300 bg-green-100 text-green-700" : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                {filter.label}
                <span className="rounded-full bg-white/70 px-1 text-[11px]">
                  {filter.count}
                </span>
              </button>
            ))}
            <div className="relative ml-auto">
              <input
                value={filterSearch}
                onChange={(event) => {
                  setFilterSearch(event.target.value);
                  setExpandedId(null);
                }}
                placeholder="차량번호 / 고객명"
                className="h-7 w-44 rounded-md border border-gray-300 px-2.5 pr-7 text-xs outline-none focus:border-green-500"
              />
              {filterSearch && (
                <button
                  type="button"
                  onClick={() => setFilterSearch("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            {(filterKind !== "all" || filterSearch) && (
              <span className="text-xs text-gray-500">
                {visible.length}건 표시
              </span>
            )}
          </div>
          <div className="min-h-0 flex-1">
            <FixedHeadTable
              columns={columns}
              rows={visible}
              rowKey={(item) => item.id}
              rowSize="sm"
              height={null}
              tableTextClass="text-xs"
              wheelSelect={false}
              expandedKey={expandedId}
              expandedRowRender={(item) => (
                <div className="p-2">
                  {item.parseError ? (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <XCircle size={14} />
                      {item.filename}: {item.parseError}
                    </div>
                  ) : (
                    <>
                      <div className="mb-1.5 text-xs font-semibold text-gray-600">
                        {item.filename} — 정비상세 {item.detailCount}건
                      </div>
                      <DetailTable rows={item.details} />
                    </>
                  )}
                </div>
              )}
              measureRenderedRowGroup
              getRowClassName={(item) => (item.parseError ? "bg-red-50" : "")}
              emptyText="파일 없음"
            />
          </div>
        </section>
        {errors.length > 0 && (
          <div className="shrink-0 rounded-md border border-red-100 bg-red-50 px-3 py-2">
            {errors.map((item) => (
              <div key={item.id} className="text-xs text-red-600">
                [파싱오류] {item.filename}: {item.parseError}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

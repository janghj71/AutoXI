import { useMemo, useState } from "react";
import {
  BellRing,
  Check,
  FileCheck2,
  FileText,
  MessageSquare,
  Save,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useAlert } from "../../alerts";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Select from "../../components/Select";

const SHOP_NAME = "오토세븐11호점";
const TODAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
}).format(new Date());

const SEND_TIME_OPTIONS = Array.from({ length: 13 }, (_, index) => {
  const hour = String(index + 9).padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}시` };
});

const MESSAGE_TYPES = [
  { id: "individual", label: "개별문자", icon: MessageSquare, group: "개별 발송" },
  { id: "estimate", label: "점검정비견적서", icon: FileText, group: "인쇄물 발송" },
  { id: "statement", label: "점검정비명세서", icon: FileCheck2 },
  { id: "privacy", label: "개인정보활용동의서", icon: ShieldCheck },
  { id: "arrival", label: "입고문자", icon: BellRing, group: "진행 안내" },
  { id: "complete", label: "수리완료문자", icon: Check },
  { id: "release", label: "출고문자", icon: Send },
  { id: "kakao", label: "알림톡", icon: BellRing, group: "알림톡" },
];

const DOCUMENT_LABELS = {
  estimate: "점검정비견적서",
  statement: "점검정비명세서",
  privacy: "개인정보활용동의서",
};

const DEFAULT_PHRASES = [
  { id: "visit", name: "방문 감사", text: "방문해 주셔서 감사합니다. 안전운전하세요." },
  { id: "contact", name: "연락 요청", text: "차량 정비 관련하여 연락 부탁드립니다." },
];

const SENDER_OPTIONS = ["080-258-0615", "031-000-1111"];

function dueTime(value) {
  const time = String(value || "").split(" ")[1];
  if (!time) return "";
  const [hour, minute] = time.split(":");
  return `${Number(hour)}시 ${minute}분`;
}

function smsByteLength(value) {
  return [...value].reduce((sum, character) => sum + (character.charCodeAt(0) > 127 ? 2 : 1), 0);
}

function buildStatusMessage(type, sale) {
  const accidentLine = sale.type === "보험" ? `- 사고번호: ${sale.accidentNo || ""}\n` : "";
  const commonVehicle = `- 사고차명: ${sale.car || ""}\n- 차량번호: ${sale.carNo || ""}`;

  if (type === "arrival") {
    return `[입고 안내]\n${accidentLine}- 입고일시: ${sale.date || ""}\n${commonVehicle}\n- 출고예정: ${dueTime(sale.due)}\n- 수리공장: ${SHOP_NAME}\n\n${SHOP_NAME}에 입고되었습니다.`;
  }

  if (type === "complete") {
    return `[수리 완료 안내]\n- 수리공장: ${SHOP_NAME}\n- 사고번호: ${sale.accidentNo || ""}\n- 입고일시: ${sale.date || ""}\n- 출고예정: ${dueTime(sale.due)}\n- 차량번호: ${sale.carNo || ""}\n- 사고차명: ${sale.car || ""}\n\n차량 수리가 완료되었습니다.`;
  }

  return `[출고 안내]\n- 사고번호: ${sale.accidentNo || ""}\n- 입고일시: ${sale.date || ""}\n- 사고차명: ${sale.car || ""}\n- 차량번호: ${sale.carNo || ""}\n- 출고일자: ${sale.release || TODAY}\n\n차량이 출고되었습니다.`;
}

function buildDocumentMessage(type, sale) {
  return `[${SHOP_NAME}]\n${sale.customer || "고객"} 고객님의 ${DOCUMENT_LABELS[type]}입니다.\n\n[인쇄물 URL 자동 첨부]`;
}

function RecipientCard({ checked, onChange, title, name, phone, detail }) {
  return (
    <label className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 hover:border-green-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-3.5 accent-green-600"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <strong className="text-xs text-gray-800">{title}</strong>
          <span className="truncate text-xs text-gray-600">{name || "-"}</span>
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-gray-400">
          {phone || "휴대번호 없음"}{detail ? ` · ${detail}` : ""}
        </span>
      </span>
    </label>
  );
}

function CustomerRecipientSummary({ checked, onChange, sale }) {
  return (
    <label className="block min-w-0 cursor-pointer border-r border-gray-200 pr-3">
      <span className="mb-1 block text-[11px] font-semibold text-gray-600">수신고객</span>
      <span className="flex h-[30px] min-w-0 items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="size-3.5 shrink-0 accent-green-600"
        />
        <strong className="shrink-0 text-xs text-gray-800">
          {sale.phone || "휴대번호 없음"}
        </strong>
        <span className={`truncate text-xs ${sale.customer ? "text-gray-600" : "text-gray-400"}`}>
          {sale.customer || "고객명 없음"}
        </span>
        <span className="shrink-0 text-gray-300">·</span>
        <span className="truncate text-[11px] text-gray-500">
          {sale.carNo || "차량번호 없음"}
        </span>
      </span>
    </label>
  );
}

export default function MessageNotificationModal({
  sale,
  onClose,
  onSend,
  allowedTypes,
  initialType = "arrival",
}) {
  const alert = useAlert();
  const availableMessageTypes = allowedTypes?.length
    ? MESSAGE_TYPES.filter((item) => allowedTypes.includes(item.id))
    : MESSAGE_TYPES;
  const defaultType = availableMessageTypes.some((item) => item.id === initialType)
    ? initialType
    : availableMessageTypes[0]?.id ?? "individual";
  const [activeType, setActiveType] = useState(defaultType);
  const [sender, setSender] = useState(SENDER_OPTIONS[0]);
  const [customerRecipient, setCustomerRecipient] = useState(true);
  const [selectedInsurerPhones, setSelectedInsurerPhones] = useState([]);
  const [individualMessage, setIndividualMessage] = useState("");
  const [savedPhrases, setSavedPhrases] = useState(DEFAULT_PHRASES);
  const [phraseName, setPhraseName] = useState("");
  const [selectedPhrase, setSelectedPhrase] = useState("");
  const [kakaoTemplate, setKakaoTemplate] = useState("정비 진행 안내");
  const [smsFallback, setSmsFallback] = useState(true);
  const [sendDate, setSendDate] = useState(TODAY);
  const [sendTime, setSendTime] = useState("");

  const isInsurance = sale?.type === "보험";
  const activeItem = availableMessageTypes.find((item) => item.id === activeType);
  const documentType = Object.hasOwn(DOCUMENT_LABELS, activeType);
  const statusType = ["arrival", "complete", "release"].includes(activeType);
  const insurerContacts = (
    sale?.insurerContacts?.length
      ? sale.insurerContacts
      : sale?.insurerContactPhone
        ? [{ name: sale.insurerContactName, phone: sale.insurerContactPhone }]
        : []
  ).slice(0, 2);

  const message = useMemo(() => {
    if (activeType === "individual") return individualMessage;
    if (documentType) return buildDocumentMessage(activeType, sale);
    if (statusType) return buildStatusMessage(activeType, sale);
    return `[${SHOP_NAME}]\n${sale.customer || "고객"} 고객님의 ${sale.carNo || ""} 차량 정비 진행 안내입니다.`;
  }, [activeType, documentType, individualMessage, sale, statusType]);

  const byteLength = smsByteLength(message);
  const selectedInsurerContacts = statusType && isInsurance
    ? insurerContacts.filter((contact) => selectedInsurerPhones.includes(contact.phone))
    : [];
  const recipientCount = Number(customerRecipient) + selectedInsurerContacts.length;

  const savePhrase = () => {
    const name = phraseName.trim();
    const text = individualMessage.trim();
    if (!name || !text) return;
    const phrase = { id: `custom-${Date.now()}`, name, text };
    setSavedPhrases((previous) => [...previous, phrase]);
    setSelectedPhrase(phrase.id);
    setPhraseName("");
  };

  const removePhrase = async (phrase) => {
    if (!(await alert.remove(`'${phrase.name}' 저장 문구를 삭제할까요?`))) return;
    setSavedPhrases((previous) => previous.filter((item) => item.id !== phrase.id));
    if (selectedPhrase === phrase.id) setSelectedPhrase("");
  };

  const footer = (
    <div className="flex w-full min-w-0 items-center gap-4">
      <div className="min-w-0 flex-1 truncate text-left text-xs text-gray-500">
        {recipientCount > 0 ? `수신 ${recipientCount}명` : "수신자를 선택해 주세요."}
        <span className="mx-2 text-gray-300">·</span>
        {activeType === "kakao" ? "알림톡" : byteLength <= 80 ? "SMS" : "LMS"}
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2">
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="primary"
          disabled={recipientCount === 0 || !message.trim() || !sendDate || !sendTime}
          onClick={() =>
            onSend?.({
              type: activeType,
              sender,
              sendDate,
              sendTime,
              message,
              recipients: [
                ...(customerRecipient
                  ? [{ kind: "customer", name: sale.customer, phone: sale.phone }]
                  : []),
                ...selectedInsurerContacts.map((contact) => ({
                  kind: "insurer",
                  name: contact.name,
                  phone: contact.phone,
                })),
              ],
            })
          }
        >
          <Send size={14} />
          발송
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      title="문자·알림 발송"
      description={`선택 ${sale.carNo || "-"}의 고객를 기준으로 발송합니다.`}
      onClose={onClose}
      dialogStyle={{ maxWidth: "860px" }}
      footer={footer}
    >
      <div className="flex h-[calc(100vh-184px)] min-h-[420px] max-h-[536px] flex-col gap-3 overflow-hidden">
        <section className="grid shrink-0 grid-cols-[minmax(0,1fr)_132px_104px_190px] items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <CustomerRecipientSummary
            checked={customerRecipient}
            onChange={setCustomerRecipient}
            sale={sale}
          />
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-gray-600">발송일자</span>
            <input
              type="date"
              value={sendDate}
              onChange={(event) => setSendDate(event.target.value)}
              className="h-[30px] w-full rounded-sm border border-gray-300 px-2 text-xs text-gray-700 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-gray-600">발송시간</span>
            <Select
              value={sendTime}
              onChange={setSendTime}
              options={SEND_TIME_OPTIONS}
              placeholder="시간 선택"
              buttonClassName="h-[30px] px-2 py-0"
            />
          </label>
          <div>
            <div className="mb-1 text-[11px] font-semibold text-gray-600">발신번호</div>
            <Select value={sender} onChange={setSender} options={SENDER_OPTIONS} />
          </div>
        </section>

        <div className="grid min-h-0 flex-1 grid-cols-[176px_minmax(0,1fr)] overflow-hidden rounded-lg border border-gray-200 bg-white">
          <nav className="min-h-0 overflow-y-auto border-r border-gray-200 bg-gray-50 p-2">
            {availableMessageTypes.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  {item.group && (
                    <div className="px-2 pb-1 pt-2 text-[10px] font-semibold text-gray-400 first:pt-0">
                      {item.group}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveType(item.id)}
                    className={`mb-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                      activeType === item.id
                        ? "bg-green-600 font-semibold text-white"
                        : "text-gray-600 hover:bg-white hover:text-gray-900"
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </div>
              );
            })}
          </nav>

          <section className="flex min-h-0 min-w-0 flex-col p-3">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">{activeItem?.label}</h3>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {documentType
                    ? "발송 시 서버에서 인쇄물 URL을 생성해 메시지 마지막에 추가합니다."
                    : statusType
                      ? "선택된 매출일지 정보를 적용한 상태 안내문입니다."
                      : activeType === "kakao"
                        ? "승인된 알림톡 템플릿으로 발송합니다."
                        : "직접 작성하거나 저장된 문구를 불러올 수 있습니다."}
                </p>
              </div>
              {activeType !== "kakao" && (
                <span className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-500">
                  {byteLength} Byte · {byteLength <= 80 ? "SMS" : "LMS"}
                </span>
              )}
            </div>

            {statusType && isInsurance && (
              <div className="mt-3 grid shrink-0 grid-cols-2 gap-2">
                {insurerContacts.map((contact, index) => (
                  <RecipientCard
                    key={`${contact.phone}-${index}`}
                    checked={selectedInsurerPhones.includes(contact.phone)}
                    onChange={(checked) =>
                      setSelectedInsurerPhones((previous) =>
                        checked
                          ? [...new Set([...previous, contact.phone])]
                          : previous.filter((phone) => phone !== contact.phone),
                      )
                    }
                    title={`보험사 담당자 ${index + 1}`}
                    name={contact.name}
                    phone={contact.phone}
                    detail={sale.insurer}
                  />
                ))}
              </div>
            )}

            {activeType === "individual" && (
              <div className="mt-3 grid shrink-0 grid-cols-[minmax(0,1fr)_76px] gap-2">
                <input
                  value={phraseName}
                  onChange={(event) => setPhraseName(event.target.value)}
                  placeholder="저장할 문구 이름"
                  className="h-[30px] min-w-0 rounded-sm border border-gray-300 px-2.5 text-xs outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15"
                />
                <Button size="sm" onClick={savePhrase} disabled={!phraseName.trim() || !individualMessage.trim()}>
                  <Save size={13} />
                  저장
                </Button>
              </div>
            )}

            {activeType === "kakao" && (
              <div className="mt-3 flex shrink-0 items-center gap-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2">
                <span className="text-xs font-semibold text-yellow-800">알림톡 템플릿</span>
                <Select
                  className="w-44"
                  value={kakaoTemplate}
                  onChange={setKakaoTemplate}
                  options={["정비 진행 안내", "입고 안내", "수리 완료 안내", "출고 안내"]}
                />
                <label className="ml-auto flex items-center gap-1.5 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={smsFallback}
                    onChange={(event) => setSmsFallback(event.target.checked)}
                    className="size-3.5 accent-green-600"
                  />
                  실패 시 문자로 발송
                </label>
              </div>
            )}

            <div className="mt-3 min-h-0 flex-1">
              {activeType === "individual" ? (
                <textarea
                  value={individualMessage}
                  onChange={(event) => setIndividualMessage(event.target.value)}
                  placeholder="문자 내용을 입력해 주세요."
                  className="h-full w-full resize-none rounded-md border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-600/15"
                />
              ) : (
                <div className="h-full overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-4">
                  <div className="whitespace-pre-wrap rounded-md border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700 shadow-sm">
                    {message}
                  </div>
                  {documentType && (
                    <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] leading-5 text-blue-700">
                      화면에서는 URL을 입력하지 않습니다. 발송 실행 시 서버에서 해당 인쇄물의 URL을 생성하여 자동으로 첨부합니다.
                    </div>
                  )}
                  {activeType === "kakao" && smsFallback && (
                    <div className="mt-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-500">
                      알림톡 전송 실패 시 위 내용과 동일한 대체 문자가 발송됩니다.
                    </div>
                  )}
                </div>
              )}
            </div>

            {activeType === "individual" && (
              <div className="mt-2 shrink-0">
                <div className="mb-1.5 text-[11px] font-semibold text-gray-600">저장 문구</div>
                <div className="h-24 overflow-y-auto rounded-md border border-gray-200 bg-gray-50">
                  {savedPhrases.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      저장된 문구가 없습니다.
                    </div>
                  ) : (
                    savedPhrases.map((phrase) => (
                      <div
                        key={phrase.id}
                        className={`grid h-8 grid-cols-[34px_minmax(0,1fr)] items-center border-b border-gray-100 last:border-b-0 ${
                          selectedPhrase === phrase.id ? "bg-green-50" : "bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          aria-label={`${phrase.name} 삭제`}
                          onClick={() => removePhrase(phrase)}
                          className="inline-flex h-full items-center justify-center border-r border-gray-100 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPhrase(phrase.id);
                            setIndividualMessage(phrase.text);
                          }}
                          className={`grid h-full min-w-0 grid-cols-[112px_minmax(0,1fr)] items-center px-3 text-left text-xs ${
                            selectedPhrase === phrase.id
                              ? "text-green-700"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <strong className="truncate pr-3 font-semibold">{phrase.name}</strong>
                          <span className="truncate text-[11px] opacity-80">{phrase.text}</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </Modal>
  );
}

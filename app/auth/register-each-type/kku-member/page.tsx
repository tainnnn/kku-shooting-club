'use client'

import { useState, FormEvent } from 'react'
import { Upload, X, Loader2, ChevronDown } from 'lucide-react'
import { Input } from "@/components/ui/input";

type FormState = {
  // ชื่อ-สกุล แบบแยก
  prefix: string
  prefix_other: string
  first_name: string
  last_name: string

  // ฟิลด์บุคลากรที่มีอยู่เดิม
  phone: string
  unit: string
  unit_position: string

  // ไฟล์แนบ
  applicantPhoto?: File | null
  citizen_card_url?: File | null
  staff_card_url?: File | null
}

const prefixes = ['นาย', 'นาง', 'นางสาว', 'อื่น ๆ']

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  pattern?: string;
  isSelect?: boolean;
  options?: string[];
  isTextArea?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  inputMode,
  pattern,
  isSelect = false,
  options,
  isTextArea = false,
}) => (
  <div className="mb-4">
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    {isSelect ? (
      <div className="relative">
        <select
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-2 text-sm shadow-sm outline-none transition duration-150 ease-in-out  focus:border-gray-600 focus:ring-1 focus:ring-gray-600 dark:bg-white text-gray-400 ${value ? 'text-gray-800' : 'text-gray-400'}`}
          >
          <option value="" disabled>{placeholder}</option>
          {options?.map((option) => (
            <option key={option} value={option} className="py-2 px-3 text-sm">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    ) : isTextArea ? (
      <textarea
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 shadow-sm outline-none transition duration-150 ease-in-out focus:border-black focus:ring-0 dark:bg-white dark:text-gray-800"
      />
    ) : (
      <Input
        required
        type={type}
        inputMode={inputMode}
        pattern={pattern}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

// (ปรับปรุง) เปลี่ยนชื่อ Component
export default function KKURegistrationForm() {
  // พรีวิวรูปทั้ง 3
  const [applicantPhotoPreview, setApplicantPhotoPreview] = useState<string | null>(null)
  const [citizen_card_urlPreview, setcitizen_card_urlPreview] = useState<string | null>(null)
  const [staff_card_urlPreview, staff_card_urlPreview] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)

  // อัปเดต state เริ่มต้นตาม type ใหม่ (แยกชื่อ-สกุล)
  const [form, setForm] = useState<FormState>({
    prefix: '',
    prefix_other: '',
    first_name: '',
    last_name: '',

    phone: '',
    unit: '',     // สังกัด
    unit_position: '', // ตำแหน่ง

    applicantPhoto: null,
    citizen_card_url: null,
    staff_card_url: null,
  })

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }))
  }

  // Handler ไฟล์ต่าง ๆ
  function onApplicantPhotoChange(file?: File | null) {
    handleChange('applicantPhoto', file ?? null)
    if (file) setApplicantPhotoPreview(URL.createObjectURL(file))
    else setApplicantPhotoPreview(null)
  }

  function oncitizen_card_urlChange(file?: File | null) {
    handleChange('citizen_card_url', file ?? null)
    if (file) setcitizen_card_urlPreview(URL.createObjectURL(file))
    else setcitizen_card_urlPreview(null)
  }

  function staff_card_urlChange(file?: File | null) {
    handleChange('staff_card_url', file ?? null)
    if (file) staff_card_urlPreview(URL.createObjectURL(file))
    else staff_card_urlPreview(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      // resolve คำนำหน้า
      const prefixResolved = form.prefix === 'อื่น ๆ' ? form.prefix_other.trim() : form.prefix
      if (!prefixResolved) {
        const el = document.getElementById('form-status')
        if (el) {
          el.innerText = 'โปรดระบุคำนำหน้า'
          el.className = 'mt-4 text-center text-red-600 font-bold'
        }
        return
      }

      // เดโม: จำลองการส่งข้อมูล
      await new Promise(resolve => setTimeout(resolve, 1500));

      const payload = {
        prefix: prefixResolved,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        unit: form.unit,
        unit_position: form.unit_position,
        // ไม่ส่งไฟล์ใน payload ตรง ๆ (ไฟล์ควรอัปขึ้น storage แล้วแนบ URL)
      }

      console.log('submit (Form Data):', payload)
      console.log('submit (Applicant Photo File):', form.applicantPhoto)
      console.log('submit (ID Card File):', form.citizen_card_url)
      console.log('submit (KKU ID Card File):', form.staff_card_url)

      const el = document.getElementById('form-status')
      if (el) {
        el.innerText = 'ส่งข้อมูลสำเร็จ (เดโม: โปรดเปลี่ยน flow นี้ภายหลัง)'
        el.className = 'mt-4 text-center text-green-600 font-bold'
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50 py-10">
      <div className="w-full max-w-xl px-4 md:px-0">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-700">ลงทะเบียนสมัครแข่งขัน</h1>
        </div>

        {/* Divider */}
        <div className="mb-12 flex w-full items-center gap-3 text-gray-500">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-sm md:text-base">บุคลากรมหาวิทยาลัยขอนแก่น</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] border border-gray-100 sm:p-8">

          <form onSubmit={onSubmit} noValidate>

            {/* คำนำหน้า (ใช้สไตล์เดียวกับ select อื่น ๆ) */}
            <InputField
              label="คำนำหน้า"
              placeholder="เลือกคำนำหน้า"
              value={form.prefix}
              onChange={(v) => handleChange('prefix', v)}
              isSelect
              options={prefixes}
            />
            {form.prefix === 'อื่น ๆ' && (
              <div className="mt-2">
                <label className="mb-1 block text-xs text-gray-500">ระบุคำนำหน้า</label>
                <Input
                  required
                  value={form.prefix_other}
                  onChange={(e) => handleChange('prefix_other', e.target.value)}
                  placeholder="เช่น ดร., อาจารย์, คุณ, Mr., Ms."
                  maxLength={20}
                  aria-label="ระบุคำนำหน้าเอง"
                />
                <p className="mt-[5px] mb-3 px-2 text-[11px] text-gray-400">กำหนดเองได้สูงสุด 20 ตัวอักษร</p>
              </div>
            )}

            {/* ชื่อ */}
            <InputField
              label="ชื่อ"
              placeholder="ชื่อ (ไม่ต้องใส่คำนำหน้า)"
              value={form.first_name}
              onChange={(v) => handleChange('first_name', v)}
            />

            {/* นามสกุล */}
            <InputField
              label="นามสกุล"
              placeholder="นามสกุล"
              value={form.last_name}
              onChange={(v) => handleChange('last_name', v)}
            />

            {/* เบอร์โทร */}
            <InputField
              label="เบอร์โทรติดต่อ"
              placeholder="08X-XXXXXXX"
              value={form.phone}
              type="tel"
              inputMode="tel"
              onChange={(v) => handleChange('phone', v.replace(/[^\d+]/g, ''))}
            />

            {/* สังกัด */}
            <InputField
              label="สังกัด"
              placeholder="คณะ/หน่วยงาน"
              value={form.unit}
              onChange={(v) => handleChange('unit', v)}
            />

            {/* ตำแหน่ง */}
            <InputField
              label="ตำแหน่ง"
              placeholder="เช่น อาจารย์, นักวิชาการคอมพิวเตอร์"
              value={form.unit_position}
              onChange={(v) => handleChange('unit_position', v)}
            />

            {/* รูปถ่ายผู้สมัคร */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">รูปถ่ายผู้สมัคร</label>
              <div className="relative">
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${applicantPhotoPreview ? 'border-green-400' : 'border-dashed border-gray-300'} bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${applicantPhotoPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.applicantPhoto ? form.applicantPhoto.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onApplicantPhotoChange(e.target.files?.[0])}
                    required
                  />
                </label>
                {applicantPhotoPreview && (
                  <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    <button
                      type="button"
                      onClick={() => onApplicantPhotoChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                      aria-label="ลบรูปภาพ"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={applicantPhotoPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* สำเนาบัตรประชาชน */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">สำเนาบัตรประชาชน</label>
              <div className="relative">
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${citizen_card_urlPreview ? 'border-green-400' : 'border-dashed border-gray-300'} bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${citizen_card_urlPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.citizen_card_url ? form.citizen_card_url.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => oncitizen_card_urlChange(e.target.files?.[0])}
                    required
                  />
                </label>
                {citizen_card_urlPreview && (
                  <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    <button
                      type="button"
                      onClick={() => oncitizen_card_urlChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                      aria-label="ลบรูปภาพ"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={citizen_card_urlPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* บัตรแสดงตนว่าเป็นบุคลากรภายใน */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">บัตรแสดงตนว่าเป็นบุคลากรภายใน</label>
              <div className="relative">
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${staff_card_urlPreview ? 'border-green-400' : 'border-dashed border-gray-300'} bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${staff_card_urlPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.staff_card_url ? form.staff_card_url.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => staff_card_urlChange(e.target.files?.[0])}
                    required
                  />
                </label>
                {staff_card_urlPreview && (
                  <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    <button
                      type="button"
                      onClick={() => staff_card_urlChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                      aria-label="ลบรูปภาพ"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={staff_card_urlPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-5 py-3 text-white text-base font-semibold shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] transition duration-300 hover:bg-green-600 disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังส่งข้อมูล...
                </span>
              ) : (
                'ยืนยันการลงทะเบียน'
              )}
            </button>
            <div id="form-status" className="mt-4 text-center text-sm"></div>
          </form>
        </div>

        <div className="mt-8 text-xs text-gray-500 text-center">
          ระบบลงทะเบียนแข่งขันยิงปืน มหาวิทยาลัยขอนแก่น
        </div>
      </div>
    </div>
  )
}

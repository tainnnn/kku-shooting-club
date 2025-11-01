'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ChevronDown } from 'lucide-react'
import { Input } from "@/components/ui/input";


type FormState = {
  fullname: string
  phone: string
  job: string
  address: string
  applicantPhoto?: File | null
  idCard?: File | null
}


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
    // **รับ prop isTextArea**
    isTextArea = false,
}) => (
    <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
        {/* **เงื่อนไขสำหรับ SELECT** */}
        {isSelect ? (
            <div className="relative">
                {/* ... โค้ด select เดิม ... */}
                <select
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-2 text-sm text-gray-800 shadow-sm outline-none transition duration-150 ease-in-out focus:border-black focus:ring-0 dark:bg-white dark:text-gray-800
                        /* Custom styles for dropdown options (mostly supported in modern browsers) */
                        [>option]:bg-white [>option]:text-gray-800 /* Base option style */
                        [>option:hover]:bg-red-100 /* Hover effect (may not work in all browsers) */
                        [>option:checked]:bg-red-500 [>option:checked]:text-white /* Selected effect (may not work in all browsers) */
                    "
                >
                    <option value="" disabled>{placeholder}</option>
                    {options?.map((option) => (
                        <option key={option} value={option} className="py-2 px-3 text-sm">
                            {option}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
            </div>
        // **เงื่อนไขใหม่สำหรับ TEXTAREA**
        ) : isTextArea ? (
            <textarea
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                // **กำหนดจำนวนบรรทัด (row) เช่น 3 บรรทัด**
                rows={3}
                // **ใช้สไตล์เดียวกันกับ input field ทั่วไป**
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 shadow-sm outline-none transition duration-150 ease-in-out focus:border-gray-600 focus:ring-1 focus:ring-gray-600 dark:bg-white dark:text-gray-800"
            />
        // **เงื่อนไขสำหรับ INPUT (ค่าเริ่มต้น)**
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

// Component หลัก
export default function RegistrationForm() {
    const [applicantPhotoPreview, setApplicantPhotoPreview] = useState<string | null>(null) // <-- เพิ่มตัวนี้
    const [idCardPreview, setIdCardPreview] = useState<string | null>(null)       // <-- เพิ่มตัวนี้

    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState<FormState>({
        fullname: '',
        job: '',
        phone: '',
        address: '',
        applicantPhoto: null,
        idCard: null,
  })

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }))
  }

  // ++ เพิ่มฟังก์ชันสำหรับรูปถ่ายผู้สมัคร ++
  function onApplicantPhotoChange(file?: File | null) {
    handleChange('applicantPhoto', file ?? null)
    if (file) setApplicantPhotoPreview(URL.createObjectURL(file))
    else setApplicantPhotoPreview(null)
  }

  // ++ เพิ่มฟังก์ชันสำหรับสำเนาบัตรประชาชน ++
  function onIdCardChange(file?: File | null) {
    handleChange('idCard', file ?? null)
    if (file) setIdCardPreview(URL.createObjectURL(file))
    else setIdCardPreview(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      // จำลองการส่งข้อมูล
      await new Promise(resolve => setTimeout(resolve, 1500));

      const payload = {
        ...form,
        // photo: undefined, // <-- ลบตัวนี้
        applicantPhoto: undefined, // <-- เพิ่มตัวนี้ (เพื่อไม่ให้ส่ง File object ไปใน JSON)
        idCard: undefined,   // <-- เพิ่มตัวนี้
      }

      // Log แยกกันเพื่อให้เห็นชัดเจน
      console.log('submit (Form Data):', payload)
      console.log('submit (Applicant Photo File):', form.applicantPhoto)
      console.log('submit (ID Card File):', form.idCard)


      // ... (ส่วนที่เหลือของ onSubmit) ...
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50 py-10">
      <div className="w-full max-w-xl px-4 md:px-0">

        {/* Header และ Title: ใช้สีแดงเข้มตามธีม Login */}
        <div className="mb-8 text-center">
            {/* **แก้ไขสีหัวข้อให้เป็นสีแดงเข้ม (text-red-900)** */}
            <h1 className="text-4xl font-extrabold text-gray-700">ลงทะเบียนสมัครแข่งขัน</h1>
        </div>

        {/* Divider */}
        <div className="mb-12 flex w-full items-center gap-3 text-gray-500">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-sm md:text-base">บุคคลภายนอก</span>
            <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Form Card Container */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] border border-gray-100 sm:p-8">

          <form onSubmit={onSubmit} noValidate>

            {/* ชื่อ-สกุล */}
            <InputField
                label="ชื่อ-สกุล (มีคำนำหน้า)"
                placeholder="ชื่อ-สกุล"
                value={form.fullname}
                onChange={(v) => handleChange('fullname', v)}
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

            {/* อาชีพ */}
            <InputField
                label="อาชีพ"
                placeholder="อาชีพ"
                value={form.job}
                onChange={(v) => handleChange('job', v)}
            />

            {/* ที่อยู่ */}
            <InputField
            label="ที่อยู่"
            placeholder="บ้านเลขที่, หมู่, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
            value={form.address}
            onChange={(v) => handleChange('address', v)}
            // **เพิ่ม: isTextArea={true} เพื่อให้เป็นกล่องข้อความขนาดใหญ่**
            isTextArea={true}
            />



            {/* รูปถ่ายผู้สมัคร */}
            <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-gray-700">รูปถ่ายผู้สมัคร</label>
                <div className="relative">
                {/* Input Area */}
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${
                    applicantPhotoPreview ? 'border-green-400' : 'border-dashed border-gray-300' // <-- แก้ไข
                } bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                    <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${applicantPhotoPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}> {/* <-- แก้ไข */}
                        {form.applicantPhoto ? form.applicantPhoto.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'} {/* <-- แก้ไข */}
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

                {/* Preview Image */}
                {applicantPhotoPreview && (
                    <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    {/* ปุ่มลบรูปภาพ */}
                    <button
                        type="button"
                        onClick={() => onApplicantPhotoChange(null)}
                        className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                        aria-label="ลบรูปภาพ"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Image Tag */}
                    <img src={applicantPhotoPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                    </div>
                )}
                </div>
            </div>

                {/* สำเนาบัตรประชาชน */}
            <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-gray-700">สำเนาบัตรประชาชน</label>
                <div className="relative">
                {/* Input Area */}
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${
                    idCardPreview ? 'border-green-400' : 'border-dashed border-gray-300' // <-- แก้ไข
                } bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                    <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${idCardPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {form.idCard ? form.idCard.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                    </div>
                    <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onIdCardChange(e.target.files?.[0])}
                    required
                    />
                </label>

                {/* Preview Image */}
                {idCardPreview && (
                    <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    {/* ปุ่มลบรูปภาพ */}
                    <button
                        type="button"
                        onClick={() => onIdCardChange(null)}
                        className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                        aria-label="ลบรูปภาพ"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Image Tag */}
                    <img src={idCardPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                    </div>
                )}
                </div>
            </div>

            {/* Submit Button: เปลี่ยนเป็นสีแดง */}
            <button
              type="submit"
              disabled={submitting}
              // **เพิ่ม duration-300 เพื่อควบคุมความเร็วการเปลี่ยนสี**
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

        {/* Footer Space */}
        <div className="mt-8 text-xs text-gray-500 text-center">
            ระบบลงทะเบียนแข่งขันยิงปืน มหาวิทยาลัยขอนแก่น
        </div>
      </div>
    </div>
  )
}

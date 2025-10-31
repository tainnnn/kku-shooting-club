'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ChevronDown } from 'lucide-react'
import { Input } from "@/components/ui/input";



type FormState = {
  fullname: string
  studentId: string
  year: string
  faculty: string
  major: string
  kkumail: string
  phone: string
  photo?: File | null
}

const faculties = [
  'วิศวกรรมศาสตร์',
  'วิทยาศาสตร์',
  'เทคโนโลยีสารสนเทศและการสื่อสาร',
  'ศึกษาศาสตร์',
  'บริหารธุรกิจและการบัญชี',
  'มนุษยศาสตร์และสังคมศาสตร์',
  'แพทยศาสตร์',
  'ทันตแพทยศาสตร์',
  'เภสัชศาสตร์',
  'พยาบาลศาสตร์',
  'สถาปัตยกรรมศาสตร์',
  'อื่น ๆ',
]

// Component สำหรับแสดง Input Field
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
}

const InputField: React.FC<InputFieldProps> = ({ label, placeholder, value, onChange, type = 'text', inputMode, pattern, isSelect = false, options}) => (
    <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
        {isSelect ? (
            <div className="relative">
                <select
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-2 text-sm shadow-sm outline-none transition duration-150 ease-in-out  focus:border-gray-600 focus:ring-1 focus:ring-gray-600 dark:bg-white text-gray-400 ${value ? 'text-gray-800' : 'text-gray-400'}
`}
                >
                    <option value="" disabled hidden>{placeholder}</option>
                    {options?.map((option) => (
                        <option key={option} value={option} className="py-2 px-3 text-sm text-gray-800">
                            {option}
                        </option>
                    ))}
                </select>
                {/* **Icon: ลูกศร Dropdown ที่กำหนดเอง** */}
                <ChevronDown
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
            </div>
            )  : (
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
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    fullname: '',
    studentId: '',
    year: '',
    faculty: '',
    major: '',
    kkumail: '',
    phone: '',
    photo: null,
  })

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }))
  }

  function onPhotoChange(file?: File | null) {
    handleChange('photo', file ?? null)
    if (file) setPreview(URL.createObjectURL(file))
    else setPreview(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      // จำลองการส่งข้อมูล
      await new Promise(resolve => setTimeout(resolve, 1500));

      const payload = {
        ...form,
        photo: undefined,
      }
      console.log('submit:', payload, form.photo)

      // เปลี่ยนจากการใช้ alert() เป็นการแสดงข้อความบน UI แทน
      // ใช้วิธีแสดงผลลัพธ์บน UI แทนการใช้ alert() ที่ถูกจำกัด
      if (document.getElementById('form-status')) {
        document.getElementById('form-status')!.innerText = 'ส่งข้อมูลสำเร็จ (เดโม: โปรดเปลี่ยน flow นี้ภายหลัง)';
        document.getElementById('form-status')!.className = 'mt-4 text-center text-green-600 font-bold';
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
            <span className="text-sm md:text-base">นักศึกษามหาวิทยาลัยขอนแก่น</span>
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

            {/* รหัสนักศึกษา */}
            <InputField
                label="รหัสนักศึกษา (ไม่ใส่ขีด)"
                placeholder="รหัสนักศึกษา"
                value={form.studentId}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(v) => handleChange('studentId', v.replace(/\D/g, ''))}
            />

             {/* ชั้นปี */}
            <InputField
                label="ชั้นปี"
                placeholder="เลือกชั้นปี"
                value={form.year}
                onChange={(v) => handleChange('year', v)}
                isSelect
                options={[1,2,3,4,5,6].map(String)}

            />

            {/* คณะ */}
            <InputField
                label="คณะ"
                placeholder="เลือกคณะ"
                value={form.faculty}
                onChange={(v) => handleChange('faculty', v)}
                isSelect
                options={faculties}
            />

            {/* สาขา */}
            <InputField
                label="สาขา"
                placeholder="สาขาที่ศึกษา"
                value={form.major}
                onChange={(v) => handleChange('major', v)}
            />

            {/* kkumail */}
            <InputField
                label="KKU Mail"
                placeholder="example@kkumail.com"
                value={form.kkumail}
                type="email"
                onChange={(v) => handleChange('kkumail', v)}
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

            {/* รูปถ่ายผู้สมัคร */}
            <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-gray-700">รูปถ่ายผู้สมัคร</label>
                <div className="relative">

                    {/* Input Area */}
                    <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${preview ? 'border-green-400' : 'border-dashed border-gray-300'} bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                        <div className="flex items-center gap-3">
                            <Upload className="h-4 w-4 text-gray-500" />
                            <span className={`truncate ${preview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                {form.photo ? form.photo.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                            </span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onPhotoChange(e.target.files?.[0])}
                            required
                        />
                    </label>

                    {/* Preview Image */}
                    {preview && (
                        <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                            {/* ปุ่มลบรูปภาพ */}
                            <button
                                type="button"
                                onClick={() => onPhotoChange(null)}
                                className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                                aria-label="ลบรูปภาพ"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {/* Image Tag */}
                            {/* เรายังคงใช้ <img> ปกติเพื่อพรีวิว local URL ได้ทันที */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={preview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
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

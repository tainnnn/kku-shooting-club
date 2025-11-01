import Navbar from "@/components/Navbar";
import Link from "next/link";


function Myreg() {

    return (
      <>
        <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white ">
            <Navbar />

            <div className="bg-gray-200 mx-5 my-5 rounded-md p-2
                          flex-auto flex flex-col justify-center items-center
                          text-center text-xl">

                <div className="text-gray-400 mb-2">
                    คุณยังไม่ได้ทำการลงทะเบียน
                </div>
                <Link
                    href="/auth/register-condition"
                    className="text-blue-500 hover:underline"
                    >
                    คลิกที่นี่เพื่อลงทะเบียน
                </Link>
            </div>
        </div>
      </>
    );

  }

export default Myreg;

import Navbar from "@/components/Navbar";
import Link from "next/link";


function Contact() {

    return (
      <>
        <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white ">
            <Navbar />

            <div className="bg-gray-200 mx-5 my-5 rounded-md p-2 flex-auto flex flex-col justify-center items-center text-center text-xl">
                <div className="text-black text-[150px] mb-2">
                    ติดต่อเนฟวี่
                </div>
            </div>
        </div>
      </>
    );

  }

export default Contact;

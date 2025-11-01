import Navbar from "@/components/Navbar";
import Link from "next/link";


function Myreg_after_login() {

    return (
      <>
        <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white ">
            <Navbar />

            <div className="bg-gray-200 mx-5 my-5 rounded-md p-2
                          flex-auto flex flex-col justify-center items-center
                          text-center text-xl">

            </div>
        </div>
      </>
    );

  }

export default Myreg_after_login;

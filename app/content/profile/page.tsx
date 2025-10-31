import Navbar from "@/components/Navbar";
import Link from "next/link";


function Profile() {

    return (
      <>
        <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white ">
            <Navbar />

            <div className="bg-gray-200 mx-5 my-5 rounded-md p-2 flex-auto flex flex-col justify-center items-center text-center text-xl">
                <div className="text-gray-400 mb-2">
                    Profile
                </div>
            </div>
        </div>
      </>
    );

  }

export default Profile;

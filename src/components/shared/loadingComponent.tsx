
const LoadingComponent = () => {
  return (
    <div className="w-screen h-screen m-0 bg-white mx-auto flex justify-center items-center ">

    <div
        className="w-40 h-40 grid place-items-center absolute top-[40%] sm:right-[40%] xs:right-[30%] [transition:all_400ms_ease] hover:-translate-y-4">

        <div className="w-28 h-28 absolute bg-pink-600/30 rounded-lg animate-[spinIn_1s_linear_infinite]"></div>
        <div className="w-32 h-32 absolute bg-purple-600/20 shadow-xl rounded-full"></div>
        <div
            className="bg-linear-to-r from-sky-500 to-yellow-500/30 rounded-full text-center  items-center text-[#000e17] font-semibold w-40 h-40 flex justify-center animate-[spinOut_1s_linear_infinite]">

        <h3 className="absolute -rotate-360 text-white text-sm font-serif font-semibold">LOADING ...</h3>
        </div>
    </div>
</div>
  )
}

export default LoadingComponent

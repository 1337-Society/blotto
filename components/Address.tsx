export interface AddressProps {
  address: string;
}

// TODO make this address component nicer
export default function Address({ address }: AddressProps) {
  return (
    <div className="w-full max-w-[20rem]">
      <div className="relative">
        <input
          id="copy-button"
          type="text"
          className="col-span-6 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={address}
          disabled
        />
      </div>
    </div>
  );
}

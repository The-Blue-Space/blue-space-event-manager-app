import { empty_01 } from "@/constants/assets";
import useCustomNavigation from "@/hooks/use-navigation";
import Image from "next/image";
import { ReactNode } from "react";
import { Plus } from "lucide-react";
import AppButton from "../app-button";

interface IEmptyPage {
    label: ReactNode;
    btnLabel: string;
    onClick: ()=> void;
}

const EmptyPage = (props: IEmptyPage) => {
    const {label, onClick, btnLabel} = props;
	const { pathname } = useCustomNavigation();
	const links = pathname.split("/");
	const name = links[links.length > 0 ? links.length - 1 : links.length];
	return (
		<div className="flex flex-col items-center justify-center h-full lg:gap-3 grow">
			<h1 className="capitalize heading-4 text-primary">{name.split("-").join(" ")} page</h1>
			<Image
				src={empty_01}
				alt="EmptyPage"
				className="object-cover lg:w-1/3 h-96 lg:h-60"
			/>
			<div className="flex flex-col gap-4 items-center justify-center">
				<span className="body-3 text-neutral-700">{label}</span>
				{/* <span className="body-3 text-neutral-700">coming soon</span> */}
                <AppButton
                    variant='black'
                    leftIcon={<Plus size={16} />}
                    onClick={onClick}
                    className='flex items-center py-2 rounded-lg'
                >
                    {btnLabel}
                </AppButton>
			</div>
		</div>
	);
};

export default EmptyPage;

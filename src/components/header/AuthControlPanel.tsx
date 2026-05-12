import SignInButtons from '@/components/ui/SignInButtons/SignInButtons'
import { X } from 'lucide-react'
import { useTranslation } from '@/providers/LocaleProvider'

export default function AuthControlPanel({
	handleClose,
}: {
	handleClose: () => void
}) {
	const { t } = useTranslation()
	return (
		<div
			className='fixed top-0 left-0 w-screen h-dvh z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
			onClick={handleClose}
		>
			<div
				className='relative w-full max-w-100 mx-4 bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl'
				onClick={event => event.stopPropagation()}
			>
				<button
					onClick={handleClose}
					className='absolute right-3 top-3.5 text-zinc-500 hover:text-white transition-colors'
				>
					<X size={20} className='cursor-pointer' />
				</button>

				<div
					role='group'
					aria-labelledby='header-signin-title'
					className='flex flex-col gap-4 items-center'
				>
					<h2
						id='header-signin-title'
						className='text-center text-lg font-semibold text-zinc-50'
					>
						{t('auth', 'signInWith')}
					</h2>
					<SignInButtons />
				</div>
			</div>
		</div>
	)
}

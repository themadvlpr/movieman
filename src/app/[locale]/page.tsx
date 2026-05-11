"use client"
import { useTranslations } from 'next-intl';

export default function HomePage() {
	const t = useTranslations();
	return (
		<div>
			<p>Home</p>
		</div>
	)
}
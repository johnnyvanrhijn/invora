import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQItem {
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    question: 'Wat kost Invora?',
    answer:
      '€12 per maand exclusief BTW (€14,52 inclusief 21% BTW). Je begint met een gratis proefperiode van 30 dagen — geen creditcard nodig. Daarna betaal je maandelijks en kun je op elk moment opzeggen.',
  },
  {
    question: 'Is er een gratis proefperiode?',
    answer:
      'Ja, je kunt Invora 30 dagen gratis gebruiken. Alle functies zijn beschikbaar tijdens de proefperiode. Je hoeft geen betaalgegevens in te voeren om te starten.',
  },
  {
    question: 'Werkt Invora als ik BTW-vrijgesteld ben?',
    answer:
      'Ja, Invora is speciaal gebouwd voor BTW-vrijgestelde zorgprofessionals. De wettelijke vrijstellingstekst wordt automatisch op elke factuur gezet. Je hoeft zelf niets in te stellen.',
  },
  {
    question: 'Hoe werkt de iDEAL betaallink?',
    answer:
      'Je koppelt je eigen Mollie-account aan Invora. Bij het versturen van een factuur genereert Invora automatisch een betaallink. Je cliënt klikt op de link en betaalt direct via iDEAL. Het bedrag wordt rechtstreeks op jouw rekening gestort.',
  },
  {
    question: 'Is mijn data veilig?',
    answer:
      'Ja. Alle data wordt opgeslagen op servers in de Europese Unie (Frankfurt) en voldoet aan de AVG. Invora verkoopt nooit jouw data of die van je cliënten.',
  },
  {
    question: 'Kan ik mijn bestaande cliënten importeren?',
    answer:
      'Ja, je kunt een CSV-bestand uploaden met je cliëntenlijst. Invora importeert naam, e-mailadres en contactgegevens automatisch.',
  },
  {
    question: 'Hoe zeg ik op?',
    answer:
      'Je kunt op elk moment opzeggen via de instellingen in je account. Er zijn geen opzegtermijnen of extra kosten. Je data blijft 30 dagen beschikbaar na opzegging zodat je alles kunt exporteren.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="bg-invora-surface scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-invora-text text-3xl font-bold tracking-tight sm:text-4xl">
            Veelgestelde vragen
          </h2>
          <p className="text-invora-text-muted mt-4 text-base sm:text-lg">
            Geen antwoord op je vraag?{' '}
            <a
              href="mailto:support@invora.nl"
              className="text-invora-primary font-medium underline"
            >
              Stuur ons een mailtje
            </a>
            .
          </p>
        </div>

        <Accordion className="mt-10 gap-0">
          {FAQS.map((item, index) => (
            <AccordionItem
              key={index}
              value={String(index)}
              className="border-border border-b last:border-b-0"
            >
              <AccordionTrigger className="text-invora-text aria-expanded:text-invora-primary-dark py-5 text-base font-semibold sm:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-invora-text-muted text-sm leading-relaxed sm:text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

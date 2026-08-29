import os

template_file = "../index.html"
with open(template_file, "r", encoding="utf-8") as f:
    template_content = f.read()

# Extract header and footer parts
main_start = template_content.find("<main>")
main_end = template_content.find("</main>") + len("</main>")

header_part = template_content[:main_start]
footer_part = template_content[main_end:]

pages = {
    "storia.html": """
    <main>
        <section class="py-32 bg-brand-cream bg-opacity-20 relative min-h-screen">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="text-5xl font-serif text-brand-red mb-12">La Storia</h1>
                <div class="text-left prose prose-lg prose-slate mx-auto text-brand-dark/80 space-y-6">
                    <p class="text-xl leading-relaxed">
                        L'evento rievoca la <strong>firma della pace</strong> tra i cardinali plenipotenziari pontefici, 
                        rappresentanti di <strong>Papa Paolo IV</strong>, e il Duca d'Alba, delegato del re <strong>Filippo II re di Spagna</strong>, 
                        che pose fine alla sanguinosa &ldquo;Guerra di Campagna&rdquo;, anche detta <strong>&ldquo;Guerra del Sale&rdquo; (1556-1557)</strong> 
                        e avvenuta all'interno dell'antico Palazzo Leoncelli il 13 e 14 settembre 1557.
                    </p>
                    <p class="text-xl leading-relaxed">
                        Oggi, a contorno della <strong>rievocazione storica</strong>, viene disputata una competizione tra le sette antiche 
                        <strong>contrade di Cave</strong> che si sfidano in gare di giochi popolari e tiri di arco e balestra antica da banco.
                    </p>
                    <p class="text-xl leading-relaxed">
                        I tre cardinali plenipotenziali, Carlo Carafa nipote del papa, Guido Ascanio Sforza conte di Santa Fiora 
                        e Vitellozzo Vitelli, incontrano il Duca D'Alba grazie all'ospitalit&agrave; neutrale del 
                        <strong>Signore di Cave, Diomede Carafa</strong>, firmando il suddetto trattato che porr&agrave; le basi 
                        diplomatiche per la storica <strong>Pace di Cateau-Cambr&eacute;sis del 1559.</strong>
                    </p>
                </div>
            </div>
        </section>
    </main>
    """,
    "rievocazione.html": """
    <main>
        <section class="py-32 bg-slate-50 relative min-h-screen">
            <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 class="text-5xl font-serif text-brand-red mb-12 text-center">La Rievocazione Storica</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
                    <!-- Event 1 -->
                    <div class="bg-white p-8 rounded-xl shadow-lg border border-slate-100 relative overflow-hidden group">
                        <div class="absolute top-0 left-0 w-2 h-full bg-brand-gold"></div>
                        <h3 class="text-2xl font-serif text-brand-dark mb-4 group-hover:text-brand-red transition-colors">La Benedizione del Drappo & Il Giuramento</h3>
                        <p class="text-slate-600 leading-relaxed">
                            Dopo la celebrazione della Santa Messa, l'atmosfera si fa carica di tensione ed emozione: i priori di contrada, gli arcieri, i balestrieri e i campioni delle sette contrate si radunano per il solenne <strong>Giuramento</strong>. Davanti alla comunit&agrave; e sotto lo sguardo dei nobili, i contendenti promettono lealt&agrave; e onore, accendendo ufficialmente la miccia della competizione.
                        </p>
                    </div>
                    
                    <!-- Event 2 -->
                    <div class="bg-white p-8 rounded-xl shadow-lg border border-slate-100 relative overflow-hidden group">
                        <div class="absolute top-0 left-0 w-2 h-full bg-brand-brown"></div>
                        <h3 class="text-2xl font-serif text-brand-dark mb-4 group-hover:text-brand-red transition-colors">I Giochi Popolari</h3>
                        <p class="text-slate-600 leading-relaxed">
                            Una volta aperta la manifestazione con il solenne giuramento, le sette contrade si sfidano nei giochi popolari: sacchi, ruzzica, anelli, corda, conca e gioco della palla grossa. I partecipanti delle rispettive contrade grazie alla propria forza, destrezza e un pizzico di astuzia si mettono in gioco in queste antiche prove.
                        </p>
                    </div>
                    
                    <!-- Event 3 -->
                    <div class="bg-white p-8 rounded-xl shadow-lg border border-slate-100 relative overflow-hidden group md:col-span-2">
                        <div class="absolute top-0 left-0 w-2 h-full bg-brand-red"></div>
                        <h3 class="text-2xl font-serif text-brand-dark mb-4 group-hover:text-brand-red transition-colors">La Pace, il Corteo e lo scontro finale</h3>
                        <p class="text-slate-600 leading-relaxed mb-4">
                            Al termine dei giochi popolari, nella seconda domenica di Settembre, avviene la <strong>rievocazione storica della firma della Pace</strong>: un momento di altissimo valore simbolico in cui le storiche rappresentanze si incontrano per siglare la fine delle ostilit&agrave;. 
                        </p>
                        <p class="text-slate-600 leading-relaxed mb-4">
                            Subito dopo, la storia prende vita e sfila: il <strong>Corteo Storico</strong> attraversa le vie del paese in un trionfo di costumi d'epoca fedelissimi. Ad aprire la sfilata sono le massime autorit&agrave; dell'epoca, con le imponenti figure del Papa, dei Cardinali Plenipotenziari, del Duca d'Alba e il Marchese Diomede Carafa, signore di Cave. Dietro di loro, un fastoso seguito composto da nobili e dame nei loro raffinati velluti, cavalieri, armigeri, sbandieratori e i rappresentanti delle sette contrade.
                        </p>
                        <p class="text-slate-600 leading-relaxed">
                            Ma la pace politica cede presto il passo alla rivalit&agrave; sul campo: il pomeriggio si infiamma con la disputa dei tiri con l'Arco e con la Balestra antica da banco. Solo all'ultimo scoccare di freccia viene sollevato e assegnato il <strong>Drappo del Palio</strong> alla contrada vincitrice.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </main>
    """,
    "palio.html": """
    <main>
        <section class="py-32 bg-brand-cream bg-opacity-20 relative min-h-screen">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 class="text-5xl font-serif text-brand-red mb-6 text-center">Il Palio</h1>
                <p class="text-xl text-center text-brand-dark/70 mb-16 max-w-3xl mx-auto font-serif italic">La disputa dei giochi e la gara di arco e balestra tra le sette antiche contrade.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Game 1 -->
                    <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-brand-red hover:-translate-y-1 transition-transform">
                        <h4 class="font-serif text-xl font-bold text-brand-dark mb-3">Tiro con l'arco</h4>
                        <p class="text-sm text-slate-600 mb-3">Gli arcieri affrontano tre serie di tiri da tre frecce ciascuna. La competizione &egrave; riservata all'uso di archi Longbow o storici privi di sistemi di mira.</p>
                        <div class="bg-amber-50 p-3 rounded text-sm text-amber-900 border border-amber-200">
                            <strong>Regola:</strong> Frecce in legno con impennatura naturale recanti il nome della Contrada.
                        </div>
                    </div>
                    
                    <!-- Game 2 -->
                    <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-brand-brown hover:-translate-y-1 transition-transform">
                        <h4 class="font-serif text-xl font-bold text-brand-dark mb-3">Tiro con la balestra</h4>
                        <p class="text-sm text-slate-600 mb-3">Disciplina della Balestra antica da Banco con fusto in legno e arco in acciaio, prive di ottiche.</p>
                        <div class="bg-amber-50 p-3 rounded text-sm text-amber-900 border border-amber-200">
                            <strong>Regola:</strong> Si tirano verrette in legno con piume naturali contrassegnate dalla Contrada.
                        </div>
                    </div>

                    <!-- Game 3 -->
                    <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-brand-gold hover:-translate-y-1 transition-transform">
                        <h4 class="font-serif text-xl font-bold text-brand-dark mb-3">Gioco della Conca</h4>
                        <p class="text-sm text-slate-600 mb-3">Prova di velocit&agrave;: trasportare la conca piena d'acqua in equilibrio sulla testa per 15 metri e versarla.</p>
                        <div class="bg-amber-50 p-3 rounded text-sm text-amber-900 border border-amber-200">
                            <strong>Regola d'Oro:</strong> Durante il tragitto la conca va tenuta con una sola mano. Penalit&agrave; d'acqua in caso di infrazione.
                        </div>
                    </div>

                    <!-- Game 4 -->
                    <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-slate-700 hover:-translate-y-1 transition-transform">
                        <h4 class="font-serif text-xl font-bold text-brand-dark mb-3">Tiro alla Fune</h4>
                        <p class="text-sm text-slate-600 mb-3">Gioco di pura forza e resistenza. 5 giocatori per Contrada per trascinare il segno centrale.</p>
                        <div class="bg-amber-50 p-3 rounded text-sm text-amber-900 border border-amber-200">
                            <strong>Regola d'Oro:</strong> Proibito l'uso di guanti o scarpe antinfortunistiche. Vietato avvolgere la fune intorno al braccio.
                        </div>
                    </div>

                    <!-- Game 5 -->
                    <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-brand-green hover:-translate-y-1 transition-transform">
                        <h4 class="font-serif text-xl font-bold text-brand-dark mb-3">Gioco degli Anelli</h4>
                        <p class="text-sm text-slate-600 mb-3">Sfida individuale ad altissima precisione. Centrare un paletto a 4 metri con 3 anelli regolamentari.</p>
                        <div class="bg-amber-50 p-3 rounded text-sm text-amber-900 border border-amber-200">
                            <strong>Regola d'Oro:</strong> La linea di tiro va rispettata rigorosamente, senza sbilanciare il busto in avanti.
                        </div>
                    </div>

                    <!-- Game 6 -->
                    <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-brand-brown hover:-translate-y-1 transition-transform">
                        <h4 class="font-serif text-xl font-bold text-brand-dark mb-3">Gioco della Ruzzica</h4>
                        <p class="text-sm text-slate-600 mb-3">Gioco tradizionale. 2 giocatori si alternano nel lanciare un cerchio in legno cercando di coprire la maggior distanza.</p>
                        <div class="bg-amber-50 p-3 rounded text-sm text-amber-900 border border-amber-200">
                            <strong>Regola:</strong> Ogni Contrada gareggia con la propria cordella di lancio.
                        </div>
                    </div>

                    <!-- Game 7 -->
                    <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-brand-red hover:-translate-y-1 transition-transform">
                        <h4 class="font-serif text-xl font-bold text-brand-dark mb-3">Corsa con i sacchi</h4>
                        <p class="text-sm text-slate-600 mb-3">Sfida individuale. Completare un percorso di 20+20 metri indossando un sacco di iuta nel minor tempo.</p>
                        <div class="bg-amber-50 p-3 rounded text-sm text-amber-900 border border-amber-200">
                            <strong>Regola d'Oro:</strong> Obbligo di stacco e atterraggio a piedi uniti. Arrivo valido solo al passaggio dei piedi.
                        </div>
                    </div>

                    <!-- Game 8 -->
                    <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-brand-gold md:col-span-2 lg:col-span-2 hover:-translate-y-1 transition-transform">
                        <h4 class="font-serif text-xl font-bold text-brand-dark mb-3">Gioco della palla grossa</h4>
                        <p class="text-sm text-slate-600 mb-3">Intensa sfida di forza e strategia ispirata alla tradizione toscana. 5 atleti per Contrada in campo. Il gioco si protrae per 2 tempi da 15 minuti effettivi.</p>
                        <div class="bg-amber-50 p-3 rounded text-sm text-amber-900 border border-amber-200">
                            <strong>Regola d'Oro:</strong> Si usano solo le mani (esclusi piedi e testa). Vietato camminare con la palla ferma tra le mani (massimo 5 secondi per il possesso statico). L'area del portiere non pu&ograve; essere calpestata n&eacute; superata in fase di tiro, pena l'annullamento della rete.
                        </div>
                    </div>

                </div>
            </div>
        </section>
    </main>
    """,
    "programma.html": """
    <main>
        <section class="py-32 bg-slate-50 relative min-h-screen">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 class="text-5xl font-serif text-brand-red mb-12 text-center">Programma 2026</h1>
                
                <div class="relative border-l-4 border-brand-gold ml-4 md:ml-0 md:mx-auto md:w-full space-y-12 pb-12">
                    
                    <!-- Day 1 -->
                    <div class="relative pl-8 md:pl-0">
                        <div class="absolute left-[-11px] md:left-1/2 md:-ml-[11px] top-0 w-5 h-5 rounded-full bg-brand-red border-4 border-white shadow"></div>
                        <div class="md:w-1/2 md:pr-12 md:text-right">
                            <h3 class="text-2xl font-bold text-brand-dark mb-1">Domenica 6 Settembre</h3>
                            <h4 class="text-xl font-serif text-brand-brown mb-2">Cena Rinascimentale & Giuramento</h4>
                            <p class="text-slate-600 mb-2">
                                Piazza G. Garibaldi (Chiesa di Santo Stefano). Ore 20:00.
                            </p>
                            <p class="text-sm text-slate-500">
                                Giuramento di arcieri, balestrieri e giocatori e cerimonia di apertura. Intrattenimento con Cdc Percussion Band, Musici Venditori di sogni nel Rinascimento e Rappresentazione Teatrale.
                            </p>
                        </div>
                    </div>

                    <!-- Day 2 -->
                    <div class="relative pl-8 md:pl-0">
                        <div class="absolute left-[-11px] md:left-1/2 md:-ml-[11px] top-0 w-5 h-5 rounded-full bg-brand-brown border-4 border-white shadow"></div>
                        <div class="md:w-1/2 md:pl-12 md:ml-auto">
                            <h3 class="text-2xl font-bold text-brand-dark mb-1">7 - 12 Settembre</h3>
                            <h4 class="text-xl font-serif text-brand-brown mb-2">Giochi Popolari & Stand Gastronomico</h4>
                            <p class="text-slate-600 mb-2">
                                Piazza dei Santi Patroni.
                            </p>
                            <p class="text-sm text-slate-500">
                                Le contrade si sfidano nella Palla Grossa, Tiro alla Fune e le eliminatorie. Stand gastronomico attivo per tutta la durata dell'evento.
                            </p>
                        </div>
                    </div>

                    <!-- Day 3 -->
                    <div class="relative pl-8 md:pl-0">
                        <div class="absolute left-[-11px] md:left-1/2 md:-ml-[11px] top-0 w-5 h-5 rounded-full bg-brand-gold border-4 border-white shadow"></div>
                        <div class="md:w-1/2 md:pr-12 md:text-right">
                            <h3 class="text-2xl font-bold text-brand-dark mb-1">Sabato 12 Settembre</h3>
                            <h4 class="text-xl font-serif text-brand-brown mb-2">Giochi Popolari per Bambini</h4>
                            <p class="text-slate-600 mb-2">
                                Piazza Santi Patroni. Dalle ore 17:00.
                            </p>
                            <p class="text-sm text-slate-500">
                                Corsa nei sacchi, tiro alla fune, conca e tantissime altre sfide aspettano i bambini (dai 5 ai 17 anni).
                            </p>
                        </div>
                    </div>

                    <!-- Day 4 -->
                    <div class="relative pl-8 md:pl-0">
                        <div class="absolute left-[-11px] md:left-1/2 md:-ml-[11px] top-0 w-5 h-5 rounded-full bg-brand-red border-4 border-white shadow"></div>
                        <div class="md:w-1/2 md:pl-12 md:ml-auto">
                            <h3 class="text-2xl font-bold text-brand-dark mb-1">Domenica 13 Settembre</h3>
                            <h4 class="text-xl font-serif text-brand-brown mb-2">Il Corteo e la Firma della Pace</h4>
                            <p class="text-slate-600 mb-2">
                                Anfiteatro Comunale.
                            </p>
                            <p class="text-sm text-slate-500">
                                La Rievocazione Storica. Il fastoso corteo con nobili, dame, sbandieratori. A seguire, nel pomeriggio, la disputa di arco e balestra antica da banco per l'assegnazione finale del Palio. Stand gastronomico attivo.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    </main>
    """,
    "albo.html": """
    <main>
        <section class="py-32 bg-brand-cream bg-opacity-20 relative min-h-screen">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="text-5xl font-serif text-brand-red mb-4">Albo D'Oro</h1>
                <p class="text-xl text-brand-dark/70 mb-12 font-serif italic">La storia dei vincitori del Palio</p>
                
                <div class="bg-white rounded-xl shadow-lg border border-brand-gold/30 p-8 max-w-2xl mx-auto text-left">
                    <ul class="space-y-4 divide-y divide-slate-100">
                        <li class="py-3 flex justify-between items-center"><span class="font-bold text-brand-dark text-xl">30 | 2025</span><span class="text-brand-red font-serif text-lg">Santa Maria Vecchia Refota</span></li>
                        <li class="py-3 flex justify-between items-center"><span class="font-bold text-brand-dark text-xl">29 | 2024</span><span class="text-brand-red font-serif text-lg">Rocca di Cave</span></li>
                        <li class="py-3 flex justify-between items-center"><span class="font-bold text-brand-dark text-xl">28 | 2023</span><span class="text-brand-red font-serif text-lg">[Stemma contrada]</span></li>
                        <li class="py-3 flex justify-between items-center"><span class="font-bold text-brand-dark text-xl">27 | 2022</span><span class="text-brand-red font-serif text-lg">[Stemma contrada]</span></li>
                        <li class="py-3 flex justify-between items-center"><span class="font-bold text-brand-dark text-xl">26 | 2021</span><span class="text-brand-red font-serif text-lg">[Stemma contrada]</span></li>
                        <li class="py-3 flex justify-between items-center"><span class="font-bold text-brand-dark text-xl">25 | 2020</span><span class="text-slate-400 font-serif text-lg italic">Non Disputato</span></li>
                        <li class="py-3 flex justify-between items-center"><span class="font-bold text-brand-dark text-xl">...</span><span class="text-slate-400 font-serif text-lg"></span></li>
                        <li class="py-3 flex justify-between items-center"><span class="font-bold text-brand-dark text-xl">3 | 1998</span><span class="text-slate-400 font-serif text-lg italic">Non Assegnato</span></li>
                        <li class="py-3 flex justify-between items-center"><span class="font-bold text-brand-dark text-xl">2 | 1997</span><span class="text-brand-red font-serif text-lg">[Stemma contrada]</span></li>
                        <li class="py-3 flex justify-between items-center"><span class="font-bold text-brand-dark text-xl">1 | 1996</span><span class="text-brand-red font-serif text-lg">[Stemma contrada]</span></li>
                    </ul>
                </div>
            </div>
        </section>
    </main>
    """,
    "eventicollaborazioni.html": """
    <main>
        <section class="py-32 bg-slate-50 relative min-h-screen">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="text-5xl font-serif text-brand-red mb-12">Eventi e Collaborazioni</h1>
                <div class="bg-white p-12 rounded-xl shadow-lg border border-slate-100">
                    <p class="text-xl text-brand-dark/80 font-serif italic mb-6">In aggiornamento...</p>
                    <p class="text-slate-600">Restate sintonizzati per scoprire i nuovi eventi e le collaborazioni con scuole, associazioni ed enti del territorio per il 2026.</p>
                </div>
            </div>
        </section>
    </main>
    """
}

for page_name, main_content in pages.items():
    # Only replace <title> for specific pages
    custom_header = header_part
    if page_name == "storia.html":
        custom_header = custom_header.replace("<title>Trattato di Pace di Cave 1557 | Rievocazione Storica 2026</title>", "<title>La Storia | Trattato di Pace di Cave 1557</title>")
    elif page_name == "rievocazione.html":
        custom_header = custom_header.replace("<title>Trattato di Pace di Cave 1557 | Rievocazione Storica 2026</title>", "<title>La Rievocazione | Trattato di Pace di Cave 1557</title>")
    elif page_name == "palio.html":
        custom_header = custom_header.replace("<title>Trattato di Pace di Cave 1557 | Rievocazione Storica 2026</title>", "<title>Il Palio | Trattato di Pace di Cave 1557</title>")
    elif page_name == "programma.html":
        custom_header = custom_header.replace("<title>Trattato di Pace di Cave 1557 | Rievocazione Storica 2026</title>", "<title>Programma | Trattato di Pace di Cave 1557</title>")
    elif page_name == "albo.html":
        custom_header = custom_header.replace("<title>Trattato di Pace di Cave 1557 | Rievocazione Storica 2026</title>", "<title>Albo D'Oro | Trattato di Pace di Cave 1557</title>")

    full_html = custom_header + main_content + footer_part
    with open(f"../{page_name}", "w", encoding="utf-8") as f:
        f.write(full_html)

print("Migration completed successfully.")

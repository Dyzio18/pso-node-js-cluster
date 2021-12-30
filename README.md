# PSO algorithm in Node.js 

Presentation PL: [PDF](https://github.com/Dyzio18/pso-node-js-cluster/blob/master/pso-node-js-cluster/SRiR-patryk-nizio-pso-javascript-parallel.pdf)

## Zadanie
Celem zadania było przeprowadzenie pomiarów i zbadanie wydajności algorytmu PSO w języku JavaScript w wariancie szeregowym i równoległym.


## Algorytm PSO
Proponowany w 1995 r. przez J. Kennedy'ego i R. Eberharta artykuł „Optymalizacja roju cząstek” stał się bardzo popularny ze względu na jego ciągły proces optymalizacji, pozwalający na różne odmiany algorytmu.

Ideą algorytmu PSO jest iteracyjne przeszukiwanie przestrzeni rozwiązań problemu przy pomocy roju cząstek. Każda z cząstek posiada swoją pozycję w przestrzeni rozwiązań, prędkość oraz kierunek w jakim się porusza. Ponadto zapamiętywane jest najlepsze rozwiązanie znalezione do tej pory przez każdą z cząstek (rozwiązanie lokalne), a także najlepsze rozwiązanie z całego roju (rozwiązanie globalne). Prędkość ruchu poszczególnych cząstek zależy od położenia najlepszego globalnego i lokalnego rozwiązania oraz od prędkości w poprzednich krokach.

## Sposoby zrównoleglenia w JS

Problem równoległości możemy podzielić na dwie kategorie w zależności od środowiska.
W przypadku wymagających obliczeń, animacji po stronie przeglądarki (klienta) używamy mechanizmu Web Workerów. W przypadku środowiska Node.js możemy wykorzystać klastry oraz procesy potomne.  

### Cluster
Pojedyncza instancja Node.js działa w jednym wątku. Aby skorzystać z systemów wielordzeniowych, użytkownik czasami chce uruchomić klaster procesów Node.js, aby obsłużyć obciążenie. Moduł klastrów umożliwia łatwe tworzenie procesów potomnych, które wszystkie współdzielą porty serwera. Możemy rozwidlić (fork) proces główny na wiele procesów potomnych (zazwyczaj mających jedno dziecko na procesor). W tym przypadku dzieci mogą dzielić port z rodzicem (dzięki komunikacji między procesami lub IPC). 
Mechanizm ten został użyty w omawianej implementacji algorytmu PSO.
Więcej: https://nodejs.org/api/cluster.html

### Child Process
Możemy rozwidlić proces, główny proces może komunikować się z procesem potomnym poprzez wysyłanie i odbieranie zdarzeń. Żadna pamięć nie jest udostępniana. Wszystkie wymienione dane są „klonowane”, co oznacza, że ​​zmiana ich na jednej stronie nie zmienia jej po drugiej stronie. Problem z asynchronicznym przesyłaniem i odbieraniem danych możemy rozwiązać poprzez funkcję zwrotne (callback) lub oznaczenie funkcji jako asynchroniczna (async). W przypadku wykorzystania tego rozwiązania mamy jednak problem z wykorzystaniem dużej ilości pamięci gdyż powstanie nowego procesu to kolejna duplikacja danych a samo kopiowanie danych może trochę potrwać. 
Więcej: https://nodejs.org/api/child_process.html

### Worker Threads
Jest to nowa funkcjonalność wprowadzona w wersji 10.5.0, obecnie jest oznaczona jako eksperymentalna.
Worker Threads mają izolowane konteksty. Wymieniają informacje z głównym procesem za pomocą przekazywania wiadomości, żyją w tym samym procesie, więc zużywają znacznie mniej pamięci niż procesy potomne. Tak samo jak w przypadku wszystkich asynchronicznych akcji możemy wykorzystać elementy języka JavaScript takie jak promises, async, callback w celu synchronizacji danych.
Więcej: https://nodejs.org/api/worker_threads.html

### Web Workers
Web Workers to sposób na uruchamianie skryptów w wątkach w tle. Wątek roboczy może wykonywać zadania bez zakłócania interfejsu użytkownika. Dane są przesyłane między głównym wątkiem a pracownikami (Web Workers)  za pośrednictwem wiadomości. Ponieważ pracownicy pracują na osobnym wątku niż główny wątek wykonawczy, można wykorzystać worker do uruchamiania wymagających zadań obliczeniowych bez tworzenia blokujących instancji.
Wiecej: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers



## Credits:
https://github.com/adrianton3/pso.js/

import type { AudioTrack } from "@/state/useAudioStore";
export const NEPALI_STATIONS: AudioTrack[] = [
    {
        id: "kantipur",
        title: "Kantipur FM",
        author: "96.1 MHz",
        artwork: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Kantipur_FM.jpg",
        url: "https://radio-broadcast.ekantipur.com/stream"
    },
    {
        id: "ujyaalo",
        title: "Ujyaalo 90",
        author: "90.0 MHz",
        artwork: "https://ujyaalo.com/assets/images/logo.png",
        url: "https://stream-151.zeno.fm/h527zwd11uquv"
    },
    {
        id: "radionepal",
        title: "Radio Nepal",
        author: "100.0 MHz",
        artwork: "https://radionepal.gov.np/wp-content/uploads/2021/04/Logo.png",
        url: "http://stream1.radionepal.gov.np/live"
    },
    {
        id: "bbc",
        title: "BBC Nepali",
        author: "103.0 MHz",
        artwork: "https://news.bbcimg.co.uk/nol/shared/img/bbc_news_120x60.gif",
        url: "https://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_nepali_radio.m3u8"
    },
    {
        id: "kalika",
        title: "Kalika FM",
        author: "95.2 MHz",
        artwork: "https://kalikafm.com.np/images/logo.png",
        url: "https://streaming.softnep.net:10828/;stream.nsv&type=mp3&volume=70"
    }
];

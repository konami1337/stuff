function FindProxyForURL(url, host)
{
	if (shExpMatch(host, "*.funimation.com|derf9v1xhwwx1.cloudfront.net|d132fumi6di1wa.cloudfront.net|*.dlvr1.net|funiprod.akamaized.net|*.dadcdigital.com|*.crunchyroll.com")) {
		return "SOCKS5 127.0.0.1:1080";
    } else {
		return "DIRECT";
	}
}

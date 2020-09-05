function FindProxyForURL(url, host)
{
	if (shExpMatch(host, "*.funimation.com|*.cloudfront.net|*.dlvr1.net|funiprod.akamaized.net|*.dadcdigital.com")) {
		return "SOCKS5 127.0.0.1:1080";
    } else {
		return "DIRECT";
	}
}

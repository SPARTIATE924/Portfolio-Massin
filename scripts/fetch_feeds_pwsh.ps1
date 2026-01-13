# PowerShell script to fetch RSS feeds and write JSON for Portfolio
$feeds = @(
    @{ id='zdnet'; title='ZDNet Security'; url='https://www.zdnet.com/topic/security/rss.xml' },
    @{ id='thehackernews'; title='The Hacker News'; url='https://thehackernews.com/rss' },
    @{ id='krebsonsecurity'; title='KrebsOnSecurity'; url='https://krebsonsecurity.com/feed/' },
    @{ id='arstechnica'; title='Ars Technica Security'; url='https://feeds.arstechnica.com/arstechnica/security' }
)

$all = @()
foreach ($f in $feeds) {
    try {
        $r = Invoke-WebRequest -Uri $f.url -UseBasicParsing -TimeoutSec 20 -Headers @{ 'User-Agent' = 'rss-pwsh/1.0' }
        $xml = $null
        try { $xml = [xml]$r.Content } catch { $xml = $null }
        if ($xml -ne $null) {
            if ($xml.rss) { $nodes = $xml.rss.channel.item }
            elseif ($xml.feed) { $nodes = $xml.feed.entry }
            else { $nodes = $xml.SelectNodes('//item') }

            if ($nodes -ne $null) {
                foreach ($n in $nodes) {
                    # If title is an XML element, prefer InnerText; otherwise cast to string
                    if ($n.title -is [System.Xml.XmlElement]) { $title = $n.title.InnerText } else { $title = ($n.title -as [string]) }
                    $title = ($title -replace '\\s+', ' ').Trim()
                    $link = ''
                    if ($n.link -and $n.link.href) { $link = $n.link.href }
                    elseif ($n.link -and $n.link.'#text') { $link = $n.link.'#text' }
                    elseif ($n.link -is [string]) { $link = ($n.link -as [string]) }
                    else {
                        $ln = $n.SelectSingleNode('link[@rel="alternate"]')
                        if ($ln) { $link = $ln.href }
                    }
                    $pub = ($n.pubDate -as [string])
                    if (-not $pub) { $pub = ($n.updated -as [string]) }
                    if (-not $pub) { $pub = ($n.published -as [string]) }
                    # Handle description which may be an XmlElement
                    if ($n.description -is [System.Xml.XmlElement]) { $desc = $n.description.InnerText } else { $desc = ($n.description -as [string]) }
                    if (-not $desc) { if ($n.summary -is [System.Xml.XmlElement]) { $desc = $n.summary.InnerText } else { $desc = ($n.summary -as [string]) } }
                    $desc = ($desc -replace '\\s+', ' ')

                    $obj = [PSCustomObject]@{
                        title = $title
                        link = $link
                        pubDate = $pub
                        description = $desc
                        _source = $f.title
                    }
                    $all += $obj
                }
            }
        }
    } catch {
        Write-Output "Failed to fetch $($f.id): $($_.Exception.Message)"
    }
}

function ParseDate($s) {
    if (-not $s) { return [DateTime]::MinValue }
    try { return [DateTime]::Parse($s) } catch { return [DateTime]::MinValue }
}

$all_sorted = $all | Sort-Object @{Expression={ ParseDate($_.pubDate) };Descending=$true }
$out = @{ fetchedAt = [int][double]::Parse((Get-Date -UFormat %s)); items = $all_sorted | Select-Object -First 40 }
$outPath = 'Portfolio\assets\data\rss.json'
New-Item -ItemType Directory -Force -Path (Split-Path $outPath) | Out-Null
$json = $out | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($outPath, $json, [System.Text.Encoding]::UTF8)
Write-Output "Wrote $outPath"
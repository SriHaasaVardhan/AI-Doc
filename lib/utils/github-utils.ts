export function parseGitHubUrl(url: string): { owner: string, repo: string } | null {
  try {
    // Handle various formats: https://github.com/owner/repo, owner/repo
    let cleanUrl = url.trim();
    if (cleanUrl.endsWith('.git')) cleanUrl = cleanUrl.slice(0, -4);
    
    let owner = '';
    let repo = '';

    if (cleanUrl.includes('github.com/')) {
      const parts = cleanUrl.split('github.com/')[1].split('/');
      if (parts.length >= 2) {
        owner = parts[0];
        repo = parts[1];
      }
    } else {
      const parts = cleanUrl.split('/');
      if (parts.length === 2) {
        owner = parts[0];
        repo = parts[1];
      }
    }

    if (owner && repo) return { owner, repo };
    return null;
  } catch (e) {
    return null;
  }
}

export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null;
}

export function buildZipballUrl(owner: string, repo: string): string {
  return `https://api.github.com/repos/${owner}/${repo}/zipball`;
}

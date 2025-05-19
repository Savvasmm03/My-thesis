import React from 'react';
import AIResponseViewer from './AIResponseViewer';

const rawResponse = `Explanation:

This code checks if a number is a palindrome.

\`\`\`c
#include <stdio.h>

int main() {
    int n, r = 0, t;
    scanf("%d", &n);
    t = n;
    while (t != 0) {
        r = r * 10 + t % 10;
        t = t / 10;
    }
    if (n == r)
        printf("Palindrome");
    else
        printf("Not Palindrome");
    return 0;
}
\`\`\`

It prints "Palindrome" if the number is the same reversed.
`;

const AIResponsePage = () => {
  return <AIResponseViewer aiResponse={rawResponse} />;
};

export default AIResponsePage;

import prisma from '../client';


// 해시태그를 추가하는 함수로 특정 텍스트에서 해시태그를 찾아서 추가한다.
const AddHashtag = async (issueId: number, text: string) => {
    // 특정 텍스트에서 해시태그를 찾는다.
    const hashtags = text.match(/#[^\s#]+/g);
    if (hashtags) {
        // 해시태그를 순회하며 업데이트를 진행한다.
        for (var tag of hashtags) {
            // 해시태그를 찾아 업데이트를 진행하고 없다면 생성한다.
            await prisma.hashTag.upsert({
                where: {
                    name: tag
                },
                update: {
                    issues: {
                        connect: {
                            id: issueId
                        }
                    }
                },
                create: {
                    name: tag,
                    issues: {
                        connect: {
                            id: issueId
                        }
                    }
                }
            });
        }
    }
}

// 해시태그를 업데이트하는 함수로 특정 이슈에 연결된 해시태그를 모두 삭제하고 새로운 해시태그를 추가한다.
const UpdateHashTag = async (issueId: number, text: string) => {
    // 기존에 연결된 해시태그를 모두 삭제한다.
    const hashtags = text.match(/#[^\s#]+/g);
    if (hashtags) {
        // 해시태그를 순회하며 업데이트를 진행한다.
        for (var tag of hashtags) {
            // 기존에 issue와 연결된 모든 해시태그의 연결을 해제한다.
            await prisma.hashTag.update({
                where: {
                    name: tag
                },
                data: {
                    issues: {
                        disconnect: {
                            id: issueId
                        }
                    }
                }
            });

            // 해시태그를 찾아 업데이트를 진행하고 없다면 생성한다.
            await prisma.hashTag.upsert({
                where: {
                    name: tag
                },
                update: {
                    issues: {
                        connect: {
                            id: issueId
                        }
                    }
                },
                create: {
                    name: tag,
                    issues: {
                        connect: {
                            id: issueId
                        },
                    }
                }
            });
        }
    }

}

export default {
    AddHashtag,
    UpdateHashTag
}
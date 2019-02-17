

class addNodeError(Exception):
    def __init__(self,ErrorInfo):
        super().__init__(self,ErrorInfo) #初始化父类
        self.errorinfo=ErrorInfo
    def __str__(self):
        return self.errorinfo

class addLinkError(Exception):
    def __init__(self,ErrorInfo):
        super().__init__(self,ErrorInfo) #初始化父类
        self.errorinfo=ErrorInfo
    def __str__(self):
        return self.errorinfo

class deleteLinkError(Exception):
    def __init__(self,ErrorInfo):
        super().__init__(self,ErrorInfo) #初始化父类
        self.errorinfo=ErrorInfo
    def __str__(self):
        return self.errorinfo


class deleteNodeError(Exception):
    def __init__(self,ErrorInfo):
        super().__init__(self,ErrorInfo) #初始化父类
        self.errorinfo=ErrorInfo
    def __str__(self):
        return self.errorinfo